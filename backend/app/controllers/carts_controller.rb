class CartsController < ApplicationController
  before_action :authenticate_user!

  def show
    render json: cart_json(current_cart)
  end
end
