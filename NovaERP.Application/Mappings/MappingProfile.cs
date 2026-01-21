using AutoMapper;
using NovaERP.Application.DTOs;
using NovaERP.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace NovaERP.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name));
        CreateMap<CreateProductDto, Product>();
        CreateMap<UpdateProductDto, Product>();

        CreateMap<Category, CategoryDto>();

        CreateMap<Customer, CustomerDto>();

        CreateMap<SaleItem, SaleItemDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name));

        CreateMap<Sale, SaleDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.Name));

        CreateMap<Sale, SaleReceiptDto>()
            .ForMember(dest => dest.SubTotal, opt => opt.MapFrom(src => src.TotalAmount))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.SaleItems));
    }
}
