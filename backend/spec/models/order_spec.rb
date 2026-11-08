require 'rails_helper'

RSpec.describe Order, type: :model do
  let(:user) { User.create!(name: "Test User", email: "test@example.com", password: "password") }

  def build_order(overrides = {})
    Order.new({
      user: user,
      shipping_address: "Viale cavour 27",
      city: "Ferrara",
      postal_code: "44121",
      total: 100.0
    }.merge(overrides))
  end

  it "ordine con tutti i campi richiesti funziona correttamente" do
    expect(build_order).to be_valid
  end

  it "ordine senza indirizzo di spedizione non è valido" do
    order = build_order(shipping_address: nil)
    expect(order).not_to be_valid
    expect(order.errors[:shipping_address]).to be_present
  end

  it "ordine con totale negativo non è valido" do
    order = build_order(total: -10.0)
    expect(order).not_to be_valid
    expect(order.errors[:total]).to be_present
  end
end
