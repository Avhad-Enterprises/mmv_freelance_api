import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import {
  CreateHeroDto,
  UpdateHeroDto,
  CreateTrustedCompanyDto,
  UpdateTrustedCompanyDto,
  CreateWhyChooseUsDto,
  UpdateWhyChooseUsDto,
  CreateFeaturedCreatorDto,
  UpdateFeaturedCreatorDto,
  CreateSuccessStoryDto,
  UpdateSuccessStoryDto,
  CreateLandingFaqDto,
  UpdateLandingFaqDto,
  CreateSocialMediaDto,
  UpdateSocialMediaDto,
  BulkReorderDto,
  DeleteItemDto,
} from "./cms.dto";

// Section type constants
const SECTION_TYPES = {
  HERO: "hero",
  TRUSTED_COMPANY: "trusted_company",
  WHY_CHOOSE_US: "why_choose_us",
  FEATURED_CREATOR: "featured_creator",
  SUCCESS_STORY: "success_story",
  LANDING_FAQ: "landing_faq",
  SOCIAL_MEDIA: "social_media",
} as const;

class CmsService {
  // ==================== HERO SECTION ====================

  public async getAllHero(): Promise<any[]> {
    return await DB(T.CMS)
      .where({ section_type: SECTION_TYPES.HERO, is_deleted: false })
      .orderBy("sort_order", "asc");
  }

  public async getActiveHero(): Promise<any[]> {
    return await DB(T.CMS)
      .where({
        section_type: SECTION_TYPES.HERO,
        is_active: true,
        is_deleted: false,
      })
      .orderBy("sort_order", "asc");
  }

  public async getHeroById(id: number): Promise<any> {
    const hero = await DB(T.CMS)
      .where({
        cms_id: id,
        section_type: SECTION_TYPES.HERO,
        is_deleted: false,
      })
      .first();
    if (!hero) throw new HttpException(404, "Hero section not found");
    return hero;
  }

  public async createHero(data: CreateHeroDto): Promise<any> {
    if (isEmpty(data)) throw new HttpException(400, "Hero data is empty");

    const heroData = {
      section_type: SECTION_TYPES.HERO,
      ...data,
      created_by: data.created_by || 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_deleted: false,
    };

    const [inserted] = await DB(T.CMS).insert(heroData).returning("*");
    return inserted;
  }

  public async updateHero(data: UpdateHeroDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "Hero ID is required");

    const updateData = {
      ...data,
      updated_by: data.updated_by || 1,
      updated_at: DB.fn.now(),
    };
    delete (updateData as any).id;

    const [updated] = await DB(T.CMS)
      .where({
        cms_id: data.id,
        section_type: SECTION_TYPES.HERO,
        is_deleted: false,
      })
      .update(updateData)
      .returning("*");

    if (!updated) throw new HttpException(404, "Hero section not found");
    return updated;
  }

  public async deleteHero(data: DeleteItemDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "Hero ID is required");

    const [deleted] = await DB(T.CMS)
      .where({ cms_id: data.id, section_type: SECTION_TYPES.HERO })
      .update({
        is_deleted: true,
        deleted_by: data.deleted_by || 1,
        deleted_at: DB.fn.now(),
      })
      .returning("*");

    if (!deleted) throw new HttpException(404, "Hero section not found");
    return deleted;
  }

  // ==================== TRUSTED COMPANIES ====================

  public async getAllTrustedCompanies(): Promise<any[]> {
    return await DB(T.CMS)
      .where({ section_type: SECTION_TYPES.TRUSTED_COMPANY, is_deleted: false })
      .orderBy("sort_order", "asc");
  }

  public async getActiveTrustedCompanies(): Promise<any[]> {
    return await DB(T.CMS)
      .where({
        section_type: SECTION_TYPES.TRUSTED_COMPANY,
        is_active: true,
        is_deleted: false,
      })
      .orderBy("sort_order", "asc");
  }

  public async getTrustedCompanyById(id: number): Promise<any> {
    const company = await DB(T.CMS)
      .where({
        cms_id: id,
        section_type: SECTION_TYPES.TRUSTED_COMPANY,
        is_deleted: false,
      })
      .first();
    if (!company) throw new HttpException(404, "Trusted company not found");
    return company;
  }

  public async createTrustedCompany(
    data: CreateTrustedCompanyDto
  ): Promise<any> {
    if (isEmpty(data)) throw new HttpException(400, "Company data is empty");

    const companyData = {
      section_type: SECTION_TYPES.TRUSTED_COMPANY,
      ...data,
      created_by: data.created_by || 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_deleted: false,
    };

    const [inserted] = await DB(T.CMS).insert(companyData).returning("*");
    return inserted;
  }

  public async updateTrustedCompany(
    data: UpdateTrustedCompanyDto
  ): Promise<any> {
    if (!data.id) throw new HttpException(400, "Company ID is required");

    const updateData = {
      ...data,
      updated_by: data.updated_by || 1,
      updated_at: DB.fn.now(),
    };
    delete (updateData as any).id;

    const [updated] = await DB(T.CMS)
      .where({
        cms_id: data.id,
        section_type: SECTION_TYPES.TRUSTED_COMPANY,
        is_deleted: false,
      })
      .update(updateData)
      .returning("*");

    if (!updated) throw new HttpException(404, "Trusted company not found");
    return updated;
  }

  public async deleteTrustedCompany(data: DeleteItemDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "Company ID is required");

    const [deleted] = await DB(T.CMS)
      .where({ cms_id: data.id, section_type: SECTION_TYPES.TRUSTED_COMPANY })
      .update({
        is_deleted: true,
        deleted_by: data.deleted_by || 1,
        deleted_at: DB.fn.now(),
      })
      .returning("*");

    if (!deleted) throw new HttpException(404, "Trusted company not found");
    return deleted;
  }

  public async reorderTrustedCompanies(data: BulkReorderDto): Promise<any> {
    if (!data.items || !data.items.length) {
      throw new HttpException(400, "Items array is required");
    }

    const updates = data.items.map((item) =>
      DB(T.CMS)
        .where({ cms_id: item.id, section_type: SECTION_TYPES.TRUSTED_COMPANY })
        .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
    );

    await Promise.all(updates);
    return { message: "Reorder successful", count: data.items.length };
  }

  // ==================== WHY CHOOSE US ====================

  public async getAllWhyChooseUs(): Promise<any[]> {
    return await DB(T.CMS)
      .where({ section_type: SECTION_TYPES.WHY_CHOOSE_US, is_deleted: false })
      .orderBy("sort_order", "asc");
  }

  public async getActiveWhyChooseUs(): Promise<any[]> {
    return await DB(T.CMS)
      .where({
        section_type: SECTION_TYPES.WHY_CHOOSE_US,
        is_active: true,
        is_deleted: false,
      })
      .orderBy("sort_order", "asc");
  }

  public async getWhyChooseUsById(id: number): Promise<any> {
    const item = await DB(T.CMS)
      .where({
        cms_id: id,
        section_type: SECTION_TYPES.WHY_CHOOSE_US,
        is_deleted: false,
      })
      .first();
    if (!item) throw new HttpException(404, "Why choose us item not found");
    return item;
  }

  public async createWhyChooseUs(data: CreateWhyChooseUsDto): Promise<any> {
    if (isEmpty(data))
      throw new HttpException(400, "Why choose us data is empty");

    const itemData = {
      section_type: SECTION_TYPES.WHY_CHOOSE_US,
      ...data,
      created_by: data.created_by || 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_deleted: false,
    };

    const [inserted] = await DB(T.CMS).insert(itemData).returning("*");
    return inserted;
  }

  public async updateWhyChooseUs(data: UpdateWhyChooseUsDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "Item ID is required");

    const updateData = {
      ...data,
      updated_by: data.updated_by || 1,
      updated_at: DB.fn.now(),
    };
    delete (updateData as any).id;

    const [updated] = await DB(T.CMS)
      .where({
        cms_id: data.id,
        section_type: SECTION_TYPES.WHY_CHOOSE_US,
        is_deleted: false,
      })
      .update(updateData)
      .returning("*");

    if (!updated) throw new HttpException(404, "Why choose us item not found");
    return updated;
  }

  public async deleteWhyChooseUs(data: DeleteItemDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "Item ID is required");

    const [deleted] = await DB(T.CMS)
      .where({ cms_id: data.id, section_type: SECTION_TYPES.WHY_CHOOSE_US })
      .update({
        is_deleted: true,
        deleted_by: data.deleted_by || 1,
        deleted_at: DB.fn.now(),
      })
      .returning("*");

    if (!deleted) throw new HttpException(404, "Why choose us item not found");
    return deleted;
  }

  public async reorderWhyChooseUs(data: BulkReorderDto): Promise<any> {
    if (!data.items || !data.items.length) {
      throw new HttpException(400, "Items array is required");
    }

    const updates = data.items.map((item) =>
      DB(T.CMS)
        .where({ cms_id: item.id, section_type: SECTION_TYPES.WHY_CHOOSE_US })
        .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
    );

    await Promise.all(updates);
    return { message: "Reorder successful", count: data.items.length };
  }

  // ==================== FEATURED CREATORS ====================

  public async getAllFeaturedCreators(): Promise<any[]> {
    return await DB(T.CMS)
      .where({
        section_type: SECTION_TYPES.FEATURED_CREATOR,
        is_deleted: false,
      })
      .orderBy("sort_order", "asc");
  }

  public async getActiveFeaturedCreators(): Promise<any[]> {
    const items = await DB(T.CMS)
      .where({
        section_type: SECTION_TYPES.FEATURED_CREATOR,
        is_active: true,
        is_deleted: false,
      })
      .orderBy("sort_order", "asc")
      .limit(4);

    const userIds = items
      .filter((i) => i.user_id)
      .map((i) => i.user_id) as number[];

    if (userIds.length > 0) {
      const users = await DB(T.USERS_TABLE)
        .leftJoin(
          T.FREELANCER_PROFILES,
          `${T.USERS_TABLE}.user_id`,
          `${T.FREELANCER_PROFILES}.user_id`
        )
        .whereIn(`${T.USERS_TABLE}.user_id`, userIds)
        .select(
          `${T.USERS_TABLE}.user_id`,
          `${T.USERS_TABLE}.first_name`,
          `${T.USERS_TABLE}.last_name`,
          `${T.USERS_TABLE}.profile_picture`,
          `${T.USERS_TABLE}.city`,
          `${T.USERS_TABLE}.country`,
          `${T.FREELANCER_PROFILES}.skills`,
          `${T.FREELANCER_PROFILES}.profile_title`,
          `${T.FREELANCER_PROFILES}.projects_completed`,
          `${T.FREELANCER_PROFILES}.rate_amount`
        );

      return items.map((item) => {
        if (item.user_id) {
          const user = users.find((u) => u.user_id === item.user_id);
          if (user) {
            let skills = user.skills;
            if (typeof skills === "string") {
              try {
                skills = JSON.parse(skills);
              } catch (e) {
                skills = [];
              }
            }

            return {
              ...item,
              name: `${user.first_name} ${user.last_name}`,
              profile_image: user.profile_picture || item.profile_image,
              title: user.profile_title || item.title,
              skills: skills || item.skills,
              // Add location to bio or separate field if needed, but existing comp uses stats?
              // The frontend component uses 'city', 'country'.
              // I should modify the CMS response to include these if I want the frontend to use them.
              city: user.city,
              country: user.country,
            };
          }
        }
        return item;
      });
    }

    return items;
  }

  public async getFeaturedCreatorById(id: number): Promise<any> {
    const creator = await DB(T.CMS)
      .where({
        cms_id: id,
        section_type: SECTION_TYPES.FEATURED_CREATOR,
        is_deleted: false,
      })
      .first();
    if (!creator) throw new HttpException(404, "Featured creator not found");
    return creator;
  }

  public async createFeaturedCreator(
    data: CreateFeaturedCreatorDto
  ): Promise<any> {
    if (isEmpty(data)) throw new HttpException(400, "Creator data is empty");

    const creatorData = {
      section_type: SECTION_TYPES.FEATURED_CREATOR,
      ...data,
      created_by: data.created_by || 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_deleted: false,
    };

    const [inserted] = await DB(T.CMS).insert(creatorData).returning("*");
    return inserted;
  }

  public async updateFeaturedCreator(
    data: UpdateFeaturedCreatorDto
  ): Promise<any> {
    if (!data.id) throw new HttpException(400, "Creator ID is required");

    const updateData = {
      ...data,
      updated_by: data.updated_by || 1,
      updated_at: DB.fn.now(),
    };
    delete (updateData as any).id;

    const [updated] = await DB(T.CMS)
      .where({
        cms_id: data.id,
        section_type: SECTION_TYPES.FEATURED_CREATOR,
        is_deleted: false,
      })
      .update(updateData)
      .returning("*");

    if (!updated) throw new HttpException(404, "Featured creator not found");
    return updated;
  }

  public async deleteFeaturedCreator(data: DeleteItemDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "Creator ID is required");

    const [deleted] = await DB(T.CMS)
      .where({ cms_id: data.id, section_type: SECTION_TYPES.FEATURED_CREATOR })
      .update({
        is_deleted: true,
        deleted_by: data.deleted_by || 1,
        deleted_at: DB.fn.now(),
      })
      .returning("*");

    if (!deleted) throw new HttpException(404, "Featured creator not found");
    return deleted;
  }

  public async reorderFeaturedCreators(data: BulkReorderDto): Promise<any> {
    if (!data.items || !data.items.length) {
      throw new HttpException(400, "Items array is required");
    }

    const updates = data.items.map((item) =>
      DB(T.CMS)
        .where({
          cms_id: item.id,
          section_type: SECTION_TYPES.FEATURED_CREATOR,
        })
        .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
    );

    await Promise.all(updates);
    return { message: "Reorder successful", count: data.items.length };
  }

  // ==================== SUCCESS STORIES ====================

  public async getAllSuccessStories(): Promise<any[]> {
    return await DB(T.CMS)
      .where({ section_type: SECTION_TYPES.SUCCESS_STORY, is_deleted: false })
      .orderBy("sort_order", "asc");
  }

  public async getActiveSuccessStories(): Promise<any[]> {
    return await DB(T.CMS)
      .where({
        section_type: SECTION_TYPES.SUCCESS_STORY,
        is_active: true,
        is_deleted: false,
      })
      .orderBy("sort_order", "asc");
  }

  public async getSuccessStoryById(id: number): Promise<any> {
    const story = await DB(T.CMS)
      .where({
        cms_id: id,
        section_type: SECTION_TYPES.SUCCESS_STORY,
        is_deleted: false,
      })
      .first();
    if (!story) throw new HttpException(404, "Success story not found");
    return story;
  }

  public async createSuccessStory(data: CreateSuccessStoryDto): Promise<any> {
    if (isEmpty(data))
      throw new HttpException(400, "Success story data is empty");

    const storyData = {
      section_type: SECTION_TYPES.SUCCESS_STORY,
      ...data,
      created_by: data.created_by || 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_deleted: false,
    };

    const [inserted] = await DB(T.CMS).insert(storyData).returning("*");
    return inserted;
  }

  public async updateSuccessStory(data: UpdateSuccessStoryDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "Story ID is required");

    const updateData = {
      ...data,
      updated_by: data.updated_by || 1,
      updated_at: DB.fn.now(),
    };
    delete (updateData as any).id;

    const [updated] = await DB(T.CMS)
      .where({
        cms_id: data.id,
        section_type: SECTION_TYPES.SUCCESS_STORY,
        is_deleted: false,
      })
      .update(updateData)
      .returning("*");

    if (!updated) throw new HttpException(404, "Success story not found");
    return updated;
  }

  public async deleteSuccessStory(data: DeleteItemDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "Story ID is required");

    const [deleted] = await DB(T.CMS)
      .where({ cms_id: data.id, section_type: SECTION_TYPES.SUCCESS_STORY })
      .update({
        is_deleted: true,
        deleted_by: data.deleted_by || 1,
        deleted_at: DB.fn.now(),
      })
      .returning("*");

    if (!deleted) throw new HttpException(404, "Success story not found");
    return deleted;
  }

  public async reorderSuccessStories(data: BulkReorderDto): Promise<any> {
    if (!data.items || !data.items.length) {
      throw new HttpException(400, "Items array is required");
    }

    const updates = data.items.map((item) =>
      DB(T.CMS)
        .where({ cms_id: item.id, section_type: SECTION_TYPES.SUCCESS_STORY })
        .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
    );

    await Promise.all(updates);
    return { message: "Reorder successful", count: data.items.length };
  }

  // ==================== LANDING FAQs ====================

  public async getAllLandingFaqs(): Promise<any[]> {
    return await DB(T.CMS)
      .where({ section_type: SECTION_TYPES.LANDING_FAQ, is_deleted: false })
      .orderBy("sort_order", "asc");
  }

  public async getActiveLandingFaqs(): Promise<any[]> {
    return await DB(T.CMS)
      .where({
        section_type: SECTION_TYPES.LANDING_FAQ,
        is_active: true,
        is_deleted: false,
      })
      .orderBy("sort_order", "asc");
  }

  public async getLandingFaqById(id: number): Promise<any> {
    const faq = await DB(T.CMS)
      .where({
        cms_id: id,
        section_type: SECTION_TYPES.LANDING_FAQ,
        is_deleted: false,
      })
      .first();
    if (!faq) throw new HttpException(404, "FAQ not found");
    return faq;
  }

  public async createLandingFaq(data: CreateLandingFaqDto): Promise<any> {
    if (isEmpty(data)) throw new HttpException(400, "FAQ data is empty");

    const faqData = {
      section_type: SECTION_TYPES.LANDING_FAQ,
      ...data,
      created_by: data.created_by || 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_deleted: false,
    };

    const [inserted] = await DB(T.CMS).insert(faqData).returning("*");
    return inserted;
  }

  public async updateLandingFaq(data: UpdateLandingFaqDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "FAQ ID is required");

    const updateData = {
      ...data,
      updated_by: data.updated_by || 1,
      updated_at: DB.fn.now(),
    };
    delete (updateData as any).id;

    const [updated] = await DB(T.CMS)
      .where({
        cms_id: data.id,
        section_type: SECTION_TYPES.LANDING_FAQ,
        is_deleted: false,
      })
      .update(updateData)
      .returning("*");

    if (!updated) throw new HttpException(404, "FAQ not found");
    return updated;
  }

  public async deleteLandingFaq(data: DeleteItemDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "FAQ ID is required");

    const [deleted] = await DB(T.CMS)
      .where({ cms_id: data.id, section_type: SECTION_TYPES.LANDING_FAQ })
      .update({
        is_deleted: true,
        deleted_by: data.deleted_by || 1,
        deleted_at: DB.fn.now(),
      })
      .returning("*");

    if (!deleted) throw new HttpException(404, "FAQ not found");
    return deleted;
  }

  public async reorderLandingFaqs(data: BulkReorderDto): Promise<any> {
    if (!data.items || !data.items.length) {
      throw new HttpException(400, "Items array is required");
    }

    const updates = data.items.map((item) =>
      DB(T.CMS)
        .where({ cms_id: item.id, section_type: SECTION_TYPES.LANDING_FAQ })
        .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
    );

    await Promise.all(updates);
    return { message: "Reorder successful", count: data.items.length };
  }

  // ==================== SOCIAL MEDIA ====================

  public async getAllSocialMedia(): Promise<any[]> {
    return await DB(T.CMS)
      .where({ section_type: SECTION_TYPES.SOCIAL_MEDIA, is_deleted: false })
      .orderBy("created_at", "desc");
  }

  public async getActiveSocialMedia(): Promise<any> {
    return await DB(T.CMS)
      .where({
        section_type: SECTION_TYPES.SOCIAL_MEDIA,
        is_active: true,
        is_deleted: false,
      })
      .first();
  }

  public async getSocialMediaById(id: number): Promise<any> {
    const socialMedia = await DB(T.CMS)
      .where({
        cms_id: id,
        section_type: SECTION_TYPES.SOCIAL_MEDIA,
        is_deleted: false,
      })
      .first();
    if (!socialMedia)
      throw new HttpException(404, "Social media settings not found");
    return socialMedia;
  }

  public async createSocialMedia(data: CreateSocialMediaDto): Promise<any> {
    if (isEmpty(data))
      throw new HttpException(400, "Social media data is empty");

    const socialMediaData = {
      section_type: SECTION_TYPES.SOCIAL_MEDIA,
      ...data,
      created_by: data.created_by || 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_deleted: false,
    };

    const [inserted] = await DB(T.CMS).insert(socialMediaData).returning("*");
    return inserted;
  }

  public async updateSocialMedia(data: UpdateSocialMediaDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "Social media ID is required");

    const updateData = {
      ...data,
      updated_by: data.updated_by || 1,
      updated_at: DB.fn.now(),
    };
    delete (updateData as any).id;

    const [updated] = await DB(T.CMS)
      .where({
        cms_id: data.id,
        section_type: SECTION_TYPES.SOCIAL_MEDIA,
        is_deleted: false,
      })
      .update(updateData)
      .returning("*");

    if (!updated)
      throw new HttpException(404, "Social media settings not found");
    return updated;
  }

  public async deleteSocialMedia(data: DeleteItemDto): Promise<any> {
    if (!data.id) throw new HttpException(400, "Social media ID is required");

    const [deleted] = await DB(T.CMS)
      .where({ cms_id: data.id, section_type: SECTION_TYPES.SOCIAL_MEDIA })
      .update({
        is_deleted: true,
        deleted_by: data.deleted_by || 1,
        deleted_at: DB.fn.now(),
      })
      .returning("*");

    if (!deleted)
      throw new HttpException(404, "Social media settings not found");
    return deleted;
  }

  // ==================== COMPLETE LANDING PAGE ====================

  public async getActiveLandingPageContent(): Promise<any> {
    const [
      hero,
      trustedCompanies,
      whyChooseUs,
      featuredCreators,
      successStories,
      faqs,
      socialMedia,
    ] = await Promise.all([
      this.getActiveHero(),
      this.getActiveTrustedCompanies(),
      this.getActiveWhyChooseUs(),
      this.getActiveFeaturedCreators(),
      this.getActiveSuccessStories(),
      this.getActiveLandingFaqs(),
      this.getActiveSocialMedia(),
    ]);

    return {
      hero: hero[0] || null,
      trustedCompanies,
      whyChooseUs,
      featuredCreators,
      successStories,
      faqs,
      socialMedia: socialMedia || null,
    };
  }
}

export default CmsService;
