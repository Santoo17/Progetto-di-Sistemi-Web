class ApplicationController < ActionController::API

    rescue_from StandardError do |e|
        Rails.logger.error(e.full_message)
        render json: { error: "Errore interno del server" }, status: :internal_server_error
    end
    
    rescue_from ActiveRecord::RecordNotFound do |e|
        render json: { error: "Risorsa non trovata" }, status: :not_found
    end

    rescue_from ActiveRecord::RecordInvalid do |e|
        render json: { error: e.record.errors.full_messages.join(", ") }, status: :unprocessable_content
    end

    rescue_from ActionController::ParameterMissing do |e|
        render json: { error: "Parametro mancante: #{e.param}" }, status: :bad_request
    end


    private

    attr_reader :current_user

    def authenticate_user!
        token = request.headers["Authorization"]&.split(" ")&.last
        payload = JsonWebToken.decode(token) 
        @current_user = User.find_by(id: payload[:user_id]) if payload
        render json: { error: "Token non valido o scaduto" }, status: :unauthorized unless @current_user
    rescue JWT::DecodeError
        render json: { error: "Token non valido o scaduto" }, status: :unauthorized
    end

    def require_admin!
        render json: { error: "Accesso negato" }, status: :forbidden unless current_user.admin?
    end

    def current_cart
        @current_cart ||= current_user.cart || current_user.create_cart
    end

    def cart_json(cart)
        items = cart.cart_items.includes(product: { image_attachment: :blob })
        {
            id: cart.id,
            items: items.map do |item|
                {
                    id: item.id,
                    product_id: item.product_id,
                    title: item.product.title,
                    thumbnail: (url_for(item.product.image) if item.product.image.attached?),
                    quantity: item.quantity,
                    unit_price: item.unit_price.to_f,
                    subtotal: item.subtotal
                }
            end,
            total: cart.total
            
        }
    end

    def order_json(order)
        {
            id: order.id,
            user_id: order.user_id,
            status: order.status,
            total: order.calculate_total,
            created_at: order.created_at,
            shipping_address: order.shipping_address,
            city: order.city,
            postal_code: order.postal_code,
            items: order.order_items.includes(:product).map do |item|
                {
                    id: item.id,
                    product_id: item.product_id,
                    title: item.product.title,
                    quantity: item.quantity,
                    unit_price: item.unit_price.to_f,
                    subtotal: item.subtotal
                }
            end
        }
    end


end
