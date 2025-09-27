import DB from "../database/index.schema";
import { PermissionDto } from "../dtos/permission.dto";
import { NextFunction, Request, Response } from "express";
import PermissionService from "../services/permission.service";
import HttpException from "../exceptions/HttpException";

class permissionController {
    public PermissionService = new PermissionService();
  
 public getallpermission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const permission = await this.PermissionService.getallpermissionby();
            res.status(200).json({ data: permission, success: true });
        } catch (err) {
            next(err);
        }
    };
     public newpermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const permissionData: PermissionDto = req.body;
                const inserteddata = await this.PermissionService.createnewpermission(permissionData);
                res.status(201).json({ data: inserteddata, message: "Inserted" });
            } catch (error) {
                next(error);
            }
        
    }
     public updatepermissionbyid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
    
                const permissionData: Partial<PermissionDto> = req.body;
                const updatepermission = await this.PermissionService.updatepermissionbyids(permissionData);
                res.status(200).json({ data: updatepermission, message: "Permission updated" });
            } catch (error) {
                next(error);
            }
        };
}
export default permissionController;