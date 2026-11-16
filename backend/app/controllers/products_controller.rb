class ProductsController < ApplicationController
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  before_action :require_admin!, only: [:create, :update, :destroy]
  before_action :set_product, only: [:show, :update, :destroy]

  
  def index
    products = Product.with_attached_image
    products = products.where("? = ANY(tags)", params[:tag]) if params[:tag].present?
    products = products.where("title ILIKE ?", "%#{params[:q]}%") if params[:q].present?
    render json: products.map { |p| product_json(p) }
  end

  def show
    render json: product_json(@product)
  end

  def create
    product = Product.new(product_params)
    if product.save
      render json: product_json(product), status: :created
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @product.update(product_params)
      render json: product_json(@product)
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    if @product.destroy
      head :no_content
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def product_params
    params.permit(:title, :description, :price, :image, tags: [])
  end

  def product_json(product)
    product.as_json(except: [:created_at, :updated_at]).merge(
      "price" => product.price.to_f,
      "thumbnail" => product.image.attached? ? url_for(product.image) : nil,
      "createdAt" => product.created_at
    )
  end

  def set_product
    @product = Product.find(params[:id])
  end
end