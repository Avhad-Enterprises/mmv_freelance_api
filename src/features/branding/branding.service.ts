import { BrandingAssetsDto } from "./branding.dto";
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { BrandingAssets  } from './branding.interface';

class branding_assetsservices {
  public update = async (data: BrandingAssetsDto): Promise<any> => {
    if (isEmpty(data)) {
      throw new HttpException(400, "Data Invalid");
    }
    const res = await DB(T.BRANDING_ASSETS)
    .update(data)
    .returning("*");
    return res[0];
  }

  public getAll = async (): Promise<BrandingAssets []> => {
    try {
      const result = await DB(T.BRANDING_ASSETS)
        .where({ is_active: true, is_deleted:false })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching services');
    }
  }

  public getNavbarLogo = async (): Promise<BrandingAssets []> => {
    try {
      const result = await DB(T.BRANDING_ASSETS)
        .select("navbar_logo");
      return result;
    } catch (error) {
      throw new Error('Error fetching services');
    }
  }

  public getnavbar_logo_mobile = async (): Promise<BrandingAssets []> => {
    try {
      const result = await DB(T.BRANDING_ASSETS)
        .select("navbar_logo_mobile");
      return result;
    } catch (error) {
      throw new Error('Error fetching services');
    }
  }

  public getfooter_logo = async (): Promise<BrandingAssets []> => {
    try {
      const result = await DB(T.BRANDING_ASSETS)
        .select("footer_logo");
      return result;
    } catch (error) {
      throw new Error('Error fetching services');
    }
  }

  public getfavicon = async (): Promise<BrandingAssets []> => {
    try {
      const result = await DB(T.BRANDING_ASSETS)
        .select("favicon");
      return result;
    } catch (error) {
      throw new Error('Error fetching services');
    }
  }

}
export default branding_assetsservices;