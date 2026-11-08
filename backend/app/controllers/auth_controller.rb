class AuthController < ApplicationController
  before_action :authenticate_user!, only: [:logout, :me]

  def login
    user = User.find_by(email: params[:email].downcase.strip)
    if user&.authenticate(params[:password])
      render json: { token: JsonWebToken.encode(user_id: user.id), user: user_json(user) }
    else
      render json: { error: "Credenziali non valide" }, status: :unauthorized
    end
  end

  def logout
    head :no_content
  end

  def me
    render json: user_json(current_user)
  end

  private

  def user_json(user)
    user.slice(:id, :name, :email, :role)
  end
end
