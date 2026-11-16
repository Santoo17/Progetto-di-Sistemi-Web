require 'rails_helper'

RSpec.describe "Orders", type: :request do
  let(:user)    { User.create!(name: "Test", email: "user@example.com", password: "password123") }
  let(:admin)    { User.create!(name: "Test", email: "admin@example.com", password: "password123", role: "admin") }
  let(:product) { Product.create!(title: "Cuffie", price: 49.90) }
  let(:headers) { { "Authorization" => "Bearer #{JsonWebToken.encode(user_id: user.id)}" } }
  let(:admin_headers) { { "Authorization" => "Bearer #{JsonWebToken.encode(user_id: admin.id)}" } }
  let(:valid_params) do
  { shipping_address: "Via Roma 1", city: "Ferrara", postal_code: "44121" }
  end

  describe "POST /orders" do
    def fill_cart
      cart = user.create_cart!
      cart.cart_items.create!(product: product, quantity: 1, unit_price: product.price)
    end
    context "utente autenticato" do
      before { fill_cart }

      it "crea un ordine con successo" do
        expect { post "/orders", params: valid_params, headers: headers, as: :json
        }.to change { Order.count }.by(1)

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body["total"]).to eq(49.90)
        expect(body["items"].size).to eq(1)
        expect(user.cart.cart_items.count).to eq(0) 
      end

      it "non crea un ordine con parametri mancanti" do
        expect { post "/orders", params: valid_params.except(:shipping_address), headers: headers, as: :json
        }.not_to change { Order.count }

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["errors"]).to be_present
        expect(user.cart.cart_items.count).to eq(1)
      end

      it "admin modifica stato ordine valido successo" do
        order = Order.create!(user: user, total: 49.90, shipping_address: "Via Roma 1", city: "Ferrara", postal_code: "44121")
        patch "/orders/#{order.id}/status", params: { status: "paid" }, headers: admin_headers, as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["status"]).to eq("paid")
      end

      it "admin modifica stato ordine non valido fallisce" do
        order = Order.create!(user: user, total: 49.90, shipping_address: "Via Roma 1", city: "Ferrara", postal_code: "44121")
        patch "/orders/#{order.id}/status", params: { status: "shipped" }, headers: admin_headers, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        body = JSON.parse(response.body)
        expect(body["error"]).to eq("Transizione di stato non consentita")
      end

      it "utente non admin modifica stato ordine fallisce" do
        order = Order.create!(user: user, total: 49.90, shipping_address: "Via Roma 1", city: "Ferrara", postal_code: "44121")
        patch "/orders/#{order.id}/status", params: { status: "paid" }, headers: headers, as: :json

        expect(response).to have_http_status(:forbidden)
        body = JSON.parse(response.body)
        expect(body["error"]).to eq("Accesso negato")
      end
    end

    it "non crea un ordine con carrello vuoto" do
      post "/orders", params: valid_params, headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "non crea un ordine senza autenticazione" do
      cart = user.create_cart!
      post "/orders", params: valid_params, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
