Rails.application.routes.draw do
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  resources :products, only: [:index, :show, :create, :update, :destroy]

  resource :cart, only: [:show] do
    resources :items, controller: "cart_items", only: %i[create update destroy]
  end

  resources :orders, only: [:index, :show, :create] do
    member do
      patch :status, action: :statusUpdate
    end
  end 

  post "auth/login", to: "auth#login"
  post "auth/logout", to: "auth#logout"
  get "auth/me", to: "auth#me"
  post "auth/register", to: "auth#register"

  # Defines the root path route ("/")
  # root "posts#index"
end
