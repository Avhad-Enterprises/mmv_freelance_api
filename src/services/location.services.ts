import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { COUNTRY } from "../database/country.schema";

class locationService {

    public async getAllCountries(): Promise<any> {
        const countries = await DB(T.COUNTRY)
            .select('*');
        return countries;
    }

    public async getStatesByCountry(country_id: number): Promise<any> {
        if (!country_id) throw new HttpException(400, 'Country ID is required');
        const states = await DB(T.STATES)
            .where({ country_id });
        return states;
    }

    public async getCitiesByState(state_id: number): Promise<any> {
        if (!state_id) throw new HttpException(400, 'State ID is required');
        const cities = await DB(T.CITIES)
            .where({ state_id });
        return cities;
    }

    public async getStatesBy(country_id: number): Promise<any> {
        if (!country_id) throw new HttpException(400, 'Country ID is required');
        const states = await DB(T.STATES).where({ country_id });
        return states;
    }
    
    public async getCitiesBy(state_id: number): Promise<any> {
        if (!state_id) throw new HttpException(400, 'State ID is required');
        const cities = await DB(T.CITIES).where({ state_id });
        return cities;
    }

}
export default locationService;
