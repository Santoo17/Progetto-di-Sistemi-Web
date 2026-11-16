class AuthController < ApplicationController

  before_action :authenticate_user!, only: [:logout, :me]

  def login
    user = User.find_by(email: params[:email].downcase.strip)
    if user&.authenticate(params[:password])
      render json: { token: JsonWebToken.encode(user_id: user.id, user_role: user.role), user: user_json(user) }
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

  def register
  user = User.new(register_params)
  if user.save
    render json: { token: JsonWebToken.encode(user_id: user.id), user: user_json(user) },
           status: :created
  else
    render json: { errors: user.errors.full_messages }, status: :unprocessable_content
  end
end

  private

  def user_json(user)
    user.slice(:id, :name, :email, :role)
  end

  def register_params
    params.permit(:name, :email, :password, :password_confirmation)
  end
end
