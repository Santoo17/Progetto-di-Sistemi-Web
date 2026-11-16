class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy

  enum :status, { pending: 0, paid: 1, shipped: 2, completed: 3, cancelled: 4 }, validate: true

    ALLOWED_TRANSITIONS = {
    "pending"   => %w[paid cancelled],
    "paid"      => %w[shipped cancelled],
    "shipped"   => %w[completed],
    "completed" => [],
    "cancelled" => []
  }.freeze

  validates :shipping_address, :city, :postal_code, presence: true
  validates :total, numericality: { greater_than: 0 }

  def status_transition_allowed?(new_status)
    ALLOWED_TRANSITIONS[status].include?(new_status.to_s)
  end

  def calculate_total
    self.total = order_items.sum { |item| item.quantity * item.unit_price }.to_f
  end
end
