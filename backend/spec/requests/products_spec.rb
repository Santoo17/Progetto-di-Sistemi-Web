require 'rails_helper'
RSpec.describe "Products", type: :request do
    let(:admin)    { User.create!(name: "Admin", email: "admin@test.it", password: "password123", role: :admin) }
    let(:customer) { User.create!(name: "Customer", email: "customer@test.it", password: "password123", role: :user) }
    let(:admin_headers) { { "Authorization" => "Bearer #{JsonWebToken.encode(user_id: admin.id)}" } }
    let(:customer_headers) { { "Authorization" => "Bearer #{JsonWebToken.encode(user_id: customer.id)}" } }

    describe "GET /products" do
        it "restituisce tutti i prodotti" do
            Product.create!(title: "Cuffie", price: 49.90)
            Product.create!(title: "Mouse", price: 29.90)

            get "/products", headers: admin_headers, as: :json

            expect(response).to have_http_status(:ok)
            body = JSON.parse(response.body)
            expect(body.size).to eq(2)
        end
    end

    describe "POST /products" do
        let(:valid_params) { { title: "Tastiera", price: 59.90 } }

        context "utente admin" do
            it "crea un prodotto con successo" do
                expect { post "/products", params: valid_params, headers: admin_headers, as: :json
                }.to change { Product.count }.by(1)

                expect(response).to have_http_status(:created)
                body = JSON.parse(response.body)
                expect(body["title"]).to eq("Tastiera")
                expect(body["price"]).to eq(59.9)
            end
        end

        context "utente non admin" do
            it "non permette la creazione del prodotto" do
                expect { post "/products", params: valid_params, headers: customer_headers, as: :json
                }.not_to change { Product.count }

                expect(response).to have_http_status(:forbidden)
                body = JSON.parse(response.body)
                expect(body["error"]).to eq("Accesso negato")
            end
        end

        context "utente non autenticato" do
            it "non permette la creazione del prodotto" do
                expect { post "/products", params: valid_params, as: :json
                }.not_to change { Product.count }

                expect(response).to have_http_status(:unauthorized)
                body = JSON.parse(response.body)
                expect(body["error"]).to eq("Token non valido o scaduto")
            end
        end
    end

    describe "DELETE /products/:id" do
        let!(:product) { Product.create!(title: "Cuffie", price: 49.90) }

        context "utente admin" do
            it "elimina un prodotto con successo" do
                expect { delete "/products/#{product.id}", headers: admin_headers, as: :json
                }.to change { Product.count }.by(-1)

                expect(response).to have_http_status(:no_content)
            end
        end

        context "utente non admin" do
            it "non permette l'eliminazione del prodotto" do
                expect { delete "/products/#{product.id}", headers: customer_headers, as: :json
                }.not_to change { Product.count }

                expect(response).to have_http_status(:forbidden)
                body = JSON.parse(response.body)
                expect(body["error"]).to eq("Accesso negato")
            end
        end

        context "utente non autenticato" do
            it "non permette l'eliminazione del prodotto" do
                expect { delete "/products/#{product.id}", as: :json
                }.not_to change { Product.count }

                expect(response).to have_http_status(:unauthorized)
                body = JSON.parse(response.body)
                expect(body["error"]).to eq("Token non valido o scaduto")
            end
        end
    end

    describe "PUT /products/:id" do
        let!(:product) { Product.create!(title: "Cuffie", price: 49.90) }
        let(:valid_params) { { title: "Cuffie aggiornate", price: 59.90 } }

        context "utente admin" do
            it "aggiorna un prodotto con successo" do
                put "/products/#{product.id}", params: valid_params, headers: admin_headers, as: :json

                expect(response).to have_http_status(:ok)
                body = JSON.parse(response.body)
                expect(body["title"]).to eq("Cuffie aggiornate")
                expect(body["price"]).to eq(59.9)
            end
        end

        context "utente non admin" do
            it "non permette l'aggiornamento del prodotto" do
                put "/products/#{product.id}", params: valid_params, headers: customer_headers, as: :json

                expect(response).to have_http_status(:forbidden)
                body = JSON.parse(response.body)
                expect(body["error"]).to eq("Accesso negato")
            end
        end

        context "utente non autenticato" do
            it "non permette l'aggiornamento del prodotto" do
                put "/products/#{product.id}", params: valid_params, as: :json

                expect(response).to have_http_status(:unauthorized)
                body = JSON.parse(response.body)
                expect(body["error"]).to eq("Token non valido o scaduto")
            end
        end
    end

end