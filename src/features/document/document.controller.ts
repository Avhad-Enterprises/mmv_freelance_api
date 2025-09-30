import DB from "../../../database/index.schema";
import { DocumentDto } from './document.dto';
import { NextFunction, Request, Response } from "express";
import documentService from "./document.service";
import HttpException from "../../exceptions/HttpException";

class documentController {

    public documentService = new documentService();


    }
export default documentController;