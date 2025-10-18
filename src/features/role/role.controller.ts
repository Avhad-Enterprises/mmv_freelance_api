import DB from "../../../database/index";
import { RoleDto } from "./role.dto";
import { NextFunction, Request, Response } from "express";
import RoleService from "./role.service";
import HttpException from "../../exceptions/HttpException";

class roleController {
    public RoleService = new RoleService();

    public getallrole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = await this.RoleService.getallroleby();
            res.status(200).json({ data: role, success: true });
        } catch (err) {
            next(err);
        }
    };
    public insertrolein = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleData: RoleDto = req.body;
            const inserteddata = await this.RoleService.insertroleintable(roleData);
            res.status(201).json({ data: inserteddata, message: "Inserted" });
        } catch (error) {
            next(error);
        }

    }
    public updaterolebyid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const roleData: Partial<RoleDto> = req.body;
            const updaterole = await this.RoleService.updaterolebyidintable(roleData);
            res.status(200).json({ data: updaterole, message: "Role updated" });
        } catch (error) {
            next(error);
        }
    };

    public insertpermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleData: RoleDto = req.body;
            const inserteddata = await this.RoleService.insertpermissiontorole(roleData);
            res.status(201).json({ data: inserteddata, message: "Inserted" });
        } catch (error) {
            next(error);
        }

    }
   public getpermissionto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
             const role_id: number = req.body.permission_id;
            
            const role = await this.RoleService.getpermissiontorole(role_id);
            res.status(200).json({ data: role, message: "Role fetched" });
        } catch (error) {
            next();
        }
    };

}
export default roleController;