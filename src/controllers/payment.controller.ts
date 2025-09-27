import { Request, Response, NextFunction } from "express";
import PaymentService from "../services/payment.service";
import { TransactionDto, TransactionStatus } from "../dtos/transaction.dto";

export default class PaymentController {
    private service = new PaymentService();

    public createOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const payload: TransactionDto = req.body;

            if (!payload.amount || payload.amount <= 0) {
                return res
                    .status(400)
                    .json({ message: "Invalid amount provided" });
            }

            if (!payload.project_id || !payload.payer_id || !payload.payee_id) {
                return res
                    .status(400)
                    .json({ message: "Missing required fields" });
            }

            const result = await this.service.createOrder(payload);

            res.status(201).json({
                success: true,
                order: result.razorpayOrder,
                transaction: result.transaction,
            });
        } catch (err) {
            next(err);
        }
    };

    public getAllTransactions = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const history = await this.service.getAllHistory();

            res.status(200).json({
                success: true,
                data: history,
                message: "Full transaction history fetched successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    public getUserTransactions = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const status = req.query.transaction_status as
                | TransactionStatus
                | undefined;
            const userId = Number(req.query.user_id);
            const role = req.query.role as "client" | "freelancer";

            if (!userId || !role) {
                return res
                    .status(400)
                    .json({ message: "Missing user_id or role" });
            }

            if (role !== "client" && role !== "freelancer") {
                return res.status(400).json({ message: "Invalid role" });
            }

            const transactions = await this.service.getUserHistory(
                Number(userId),
                role,
                status as TransactionStatus | undefined
            );

            return res.status(200).json({
                message: "Fetched successfully",
                data: transactions,
            });
        } catch (err) {
            next(err);
        }
    };

    //Fetch Transaction history related to a project
    public getProjectTransactions = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const projectId = req.params.id;

            const transactions = await this.service.getProjectTransactions(
                Number(projectId)
            );
            return res.status(200).json({
                message: "Transactions fetched!",
                data: transactions,
            });
        } catch (error) {
            next(error);
        }
    };
}
