import { CreateBidDto, UpdateBidDto, BidStatusUpdateDto } from './project-bid.dto';
import { IProjectBid } from '../../interfaces/project_bid.interface';
import DB, { T } from '../../../database/index';
import { PROJECT_BIDS } from '../../../database/project_bids.schema';
import HttpException from '../../exceptions/HttpException';
import { isEmpty } from '../../utils/common';

class ProjectBidService {
    public async createBid(userId: number, freelancerId: number, applicationId: number, bidData: CreateBidDto): Promise<IProjectBid> {
        if (isEmpty(bidData)) {
            throw new HttpException(400, "Bid data is required");
        }

        // Verify project exists and is open for bids
        const project = await DB('projects_task')
            .where({ 
                projects_task_id: bidData.project_id,
                status: 0, // pending
                is_active: true,
                is_deleted: false 
            })
            .first();

        if (!project) {
            throw new HttpException(404, "Project not found or not accepting bids");
        }

        // Check if freelancer has already bid on this project
        const existingBid = await DB(PROJECT_BIDS)
            .where({
                project_id: bidData.project_id,
                freelancer_id: freelancerId,
                is_deleted: false
            })
            .first();

        if (existingBid) {
            throw new HttpException(400, "You have already placed a bid on this project");
        }

        const bid = await DB(PROJECT_BIDS)
            .insert({
                ...bidData,
                freelancer_id: freelancerId,
                application_id: applicationId,
                created_by: userId,
                updated_by: userId
            })
            .returning('*');

        return bid[0];
    }

    public async updateBid(userId: number, bidId: number, updateData: UpdateBidDto): Promise<IProjectBid> {
        if (isEmpty(updateData)) {
            throw new HttpException(400, "Update data is required");
        }

        const bid = await DB(PROJECT_BIDS)
            .where({ bid_id: bidId })
            .first();

        if (!bid) {
            throw new HttpException(404, "Bid not found");
        }

        if (bid.status !== 'pending') {
            throw new HttpException(400, "Cannot update bid that is not pending");
        }

        const updated = await DB(PROJECT_BIDS)
            .where({ bid_id: bidId })
            .update({
                ...updateData,
                updated_by: userId,
                updated_at: new Date()
            })
            .returning('*');

        return updated[0];
    }

    public async updateBidStatus(userId: number, bidId: number, statusData: BidStatusUpdateDto): Promise<IProjectBid> {
        const bid = await DB(PROJECT_BIDS)
            .where({ bid_id: bidId })
            .first();

        if (!bid) {
            throw new HttpException(404, "Bid not found");
        }

        // If accepting bid, verify user owns the project
        if (statusData.status === 'accepted') {
            const project = await DB('projects_task')
                .where({ 
                    projects_task_id: bid.project_id,
                    client_id: userId
                })
                .first();

            if (!project) {
                throw new HttpException(403, "Only project owner can accept bids");
            }

            // Start transaction to accept this bid and reject others
            const trx = await DB.transaction();
            try {
                // Update project status
                await trx('projects_task')
                    .where({ projects_task_id: bid.project_id })
                    .update({ 
                        status: 1, // assigned
                        freelancer_id: bid.freelancer_id,
                        assigned_at: new Date(),
                        updated_by: userId
                    });

                // Accept this bid
                await trx(PROJECT_BIDS)
                    .where({ bid_id: bidId })
                    .update({
                        status: 'accepted',
                        updated_by: userId
                    });

                // Reject other bids
                await trx(PROJECT_BIDS)
                    .where({ 
                        project_id: bid.project_id,
                        bid_id: '!=', bidId,
                        status: 'pending'
                    })
                    .update({
                        status: 'rejected',
                        updated_by: userId
                    });

                await trx.commit();
            } catch (error) {
                await trx.rollback();
                throw new HttpException(500, "Error accepting bid");
            }
        } else {
            // For other status updates
            await DB(PROJECT_BIDS)
                .where({ bid_id: bidId })
                .update({
                    status: statusData.status,
                    updated_by: userId
                });
        }

        const updated = await DB(PROJECT_BIDS)
            .where({ bid_id: bidId })
            .first();

        return updated;
    }

    public async getBidsByProject(projectId: number): Promise<IProjectBid[]> {
        const bids = await DB(PROJECT_BIDS)
            .where({ 
                project_id: projectId,
                is_deleted: false
            })
            .orderBy([
                { column: 'is_featured', order: 'desc' },
                { column: 'created_at', order: 'desc' }
            ]);

        return bids;
    }

    public async getBidsByFreelancer(freelancerId: number): Promise<IProjectBid[]> {
        const bids = await DB(PROJECT_BIDS)
            .where({ 
                freelancer_id: freelancerId,
                is_deleted: false
            })
            .orderBy('created_at', 'desc');

        return bids;
    }

    public async getBidById(bidId: number): Promise<IProjectBid> {
        const bid = await DB(PROJECT_BIDS)
            .where({ bid_id: bidId })
            .first();

        if (!bid) {
            throw new HttpException(404, "Bid not found");
        }

        return bid;
    }

    public async deleteBid(userId: number, bidId: number): Promise<void> {
        const bid = await DB(PROJECT_BIDS)
            .where({ bid_id: bidId })
            .first();

        if (!bid) {
            throw new HttpException(404, "Bid not found");
        }

        if (bid.status !== 'pending') {
            throw new HttpException(400, "Cannot delete bid that is not pending");
        }

        await DB(PROJECT_BIDS)
            .where({ bid_id: bidId })
            .update({
                is_deleted: true,
                deleted_by: userId,
                deleted_at: new Date()
            });
    }
}

export default ProjectBidService;