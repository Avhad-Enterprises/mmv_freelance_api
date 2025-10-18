import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { razorpay } from "../../utils/payment/razor.util";
import { ITransaction } from "./payment.interface";
import { TransactionDto, TransactionStatus } from "./payment.dto";

export default class PaymentService {
    // Create a new payment order
    public async createOrder(
        payload: TransactionDto
    ): Promise<{ razorpayOrder: any; transaction: ITransaction }> {
        const platform = "razorpay";

        const [payer, payee, job, application] = await Promise.all([
            DB(T.USERS_TABLE).where({ user_id: payload.payer_id }).first(),
            DB(T.USERS_TABLE).where({ user_id: payload.payee_id }).first(),
            DB(T.PROJECTS_TASK)
                .where({ projects_task_id: payload.project_id })
                .first(),
            DB(T.APPLIED_PROJECTS)
                .where({ applied_projects_id: payload.application_id })
                .first(),
        ]);

        if (!payer) {
            throw new HttpException(404, "Payer (client) not found");
        }
        if (!payee) {
            throw new HttpException(404, "Payee (freelancer) not found");
        }
        if (!job) {
            throw new HttpException(404, "Project not found");
        }
        if (!application) {
            throw new HttpException(404, "Application not found");
        }
        if (payer.role !== "client") {
            throw new HttpException(403, "Payer must be a client");
        }
        if (payee.role !== "freelancer") {
            throw new HttpException(403, "Payee must be a freelancer");
        }

        // if (
        //     application.applied_to_job_id !== payload.project_id ||
        //     application.applicant_id !== payload.payee_id
        // ) {
        //     throw new HttpException(
        //         400,
        //         "Application does not belong to this project or payee"
        //     );
        // }

        const order = await razorpay.orders.create({
            amount: payload.amount * 100,
            currency: payload.currency,
            receipt: `order_${Date.now()}`,
        });

        const [inserted] = await DB(T.TRANSACTION_TABLE)
            .insert<ITransaction>({
                ...payload,
                transaction_type: "escrow",
                transaction_status: "pending",
                payment_gateway: platform,
                gateway_transaction_id: order.id,
            })
            .returning("*");

        return {
            razorpayOrder: order,
            transaction: inserted,
        };
    }

    // Update transaction status
    public async updateOrderStatus(
        razorpayOrderId: string,
        status: "completed" | "failed",
        paymentId: string
    ): Promise<{ message: string }> {
        const updated = await DB(T.TRANSACTION_TABLE)
            .where({ gateway_transaction_id: razorpayOrderId })
            .update({
                transaction_status: status,
                gateway_transaction_id: paymentId,
            });

        if (!updated) {
            throw new HttpException(404, "Order not found in database");
        }

        return { message: `Transaction status updated to ${status}` };
    }

    // Fetch transaction history
    public async getAllHistory(): Promise<ITransaction[]> {
        const transactions = await DB<ITransaction>(T.TRANSACTION_TABLE)
            .select("*")
            .orderBy("created_at", "desc");

        return transactions;
    }

    //fetch transaction history of user
    public async getUserHistory(
        userId: number,
        role: "client" | "freelancer",
        status: TransactionStatus
    ): Promise<ITransaction[]> {
        const user = await DB(T.USERS_TABLE).where("user_id", userId).first();

        if (!user) {
            throw new HttpException(404, "User not found");
        }

        if (user.role !== role) {
            throw new HttpException(403, `User is not a ${role}`);
        }

        const query = DB(T.TRANSACTION_TABLE).select("*");

        if (role === "client") {
            query.where("payer_id", userId);
        } else if (role === "freelancer") {
            query.where("payee_id", userId);
        }

        if (status) {
            query.andWhere("transaction_status", status);
        }

        const result = await query.orderBy("created_at", "desc");

        return result;
    }

    //Fetch Transaction history related to a project
    public async getProjectTransactions(
        projectId: number
    ): Promise<ITransaction[]> {
        const project = await DB(T.PROJECTS_TASK)
            .where("projects_task_id", projectId)
            .first();

        if (!project) {
            throw new HttpException(404, "Project not found");
        }
        const transactions = await DB(T.TRANSACTION_TABLE)
            .select("*")
            .where("project_id", projectId);
        return transactions;
    }
}
