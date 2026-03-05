import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query("search") search?: string,
    @Query("categoryId") categoryId?: string,
    @Query("minPrice") minPrice?: number,
    @Query("maxPrice") maxPrice?: number,
    @Query("sortBy") sortBy?: any,
    @Query("isAvailable") isAvailable?: string,
    @Query("isFeatured") isFeatured?: string,
    @Query("page") page = 1,
    @Query("limit") limit = 12,
  ) {
    return this.productsService.findAll({
      search,
      categoryId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      isAvailable:
        isAvailable !== undefined ? isAvailable === "true" : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === "true" : undefined,
      page: Number(page),
      limit: Number(limit),
    });
  }

  // ⚠️ Named routes MUST come before /:id to avoid being swallowed
  @Get("featured")
  findFeatured() {
    return this.productsService.findAll({
      isFeatured: true,
      limit: 8,
      page: 1,
    });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Get(":id/related")
  findRelated(@Param("id") id: string) {
    return this.productsService.findRelated(id);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  @Put(":id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  update(@Param("id") id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @Delete(":id")
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  delete(@Param("id") id: string) {
    return this.productsService.delete(id);
  }
}
