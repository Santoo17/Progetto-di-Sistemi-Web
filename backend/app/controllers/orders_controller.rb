class OrdersController < ApplicationController
  before_action :authenticate_user!

  def index
    orders = current_user.orders.includes(order_items: :product).order(created_at: :desc)
    render json: orders.map { |order| order_json(order) }
    
  end

  def show
    render json: order_json(current_user.orders.find(params[:id]))
  end

  def create
    cart = current_cart
    items = cart.cart_items.includes(:product)

    if items.empty?
      render json: { error: "Il carrello è vuoto" }, status: :unprocessable_entity
      return
    end

    order = current_user.orders.new(order_params)
    order.total = items.sum { |item| item.quantity * item.unit_price }
    items.each do |item|
      order.order_items.build(
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unit_price
      )
    end

    Order.transaction do
      order.save!
      cart.cart_items.destroy_all
    end

    render json: order_json(order), status: :created
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
    end

    private
    def order_params
      params.require(:order).permit(:shipping_address, :city, :postal_code)
    end
end
