class OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin!, only: [:statusUpdate]
  before_action :set_order, only: [:show, :statusUpdate]

  def index
    if current_user.admin?
      orders = Order.all 
    else
      orders = current_user.orders.includes(order_items: :product).order(created_at: :desc)
    end
    render json: orders.map { |order| order_json(order) }
    
  end

  def show
    render json: order_json(@order)
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
  

  def statusUpdate
    unless @order.status_transition_allowed?(params[:status])
      render json: { error: "Transizione di stato non consentita" }, status: :unprocessable_content
      return
    end
    if @order.update(status: params[:status])
      render json: order_json(@order)
    else
      render json: { errors: @order.errors.full_messages }, status: :unprocessable_content
    end
  end


  private
  def order_params
    params.require(:order).permit(:shipping_address, :city, :postal_code, :status)
  end
  def set_order
    @order = current_user.admin? ? Order.find(params[:id]) : current_user.orders.find(params[:id])
  end
end

