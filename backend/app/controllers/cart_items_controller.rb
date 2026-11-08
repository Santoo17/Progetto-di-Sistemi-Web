class CartItemsController < ApplicationController
  before_action :authenticate_user!
  
  def create
    product = Product.find(params[:product_id])
    item = current_cart.cart_items.find_or_initialize_by(product: product)
    item.unit_price = product.price
    item.quantity = item.quantity.to_i + (params[:quantity] || 1).to_i

    if item.save
      render json: cart_json(current_cart), status: :created
    else
      render_errors(item)
    end
  end
  

  def update
    item = current_cart.cart_items.find(params[:id])
    if item.update(quantity: params[:quantity])
      render json: cart_json(current_cart.reload)
    else
      render_errors(item)
    end
  end

  def destroy
    current_cart.cart_items.find(params[:id]).destroy
    render json: cart_json(current_cart.reload)
  end

  private
  def render_errors(record)
    render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
  end
end
