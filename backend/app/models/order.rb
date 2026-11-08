class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy

  enum :status, { pending: 0, paid: 1, shipped: 2, completed: 3, cancelled: 4 }

  validates :shipping_address, :city, :postal_code, presence: true
  validates :total, numericality: { greater_than: 0 }
end
