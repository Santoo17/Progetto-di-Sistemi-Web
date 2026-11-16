# backend/app/lib/json_web_token.rb
class JsonWebToken
  SECRET_KEY = Rails.application.secret_key_base.to_s

  def self.encode(payload, exp = 30.minutes.from_now)
    JWT.encode(payload.merge(exp: exp.to_i), SECRET_KEY, "HS256")
  end

  def self.decode(token)
    JWT.decode(token, SECRET_KEY, true, algorithm: "HS256").first.with_indifferent_access
  rescue JWT::DecodeError
    nil
  end
end