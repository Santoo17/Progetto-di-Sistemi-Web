class Product < ApplicationRecord
has_one_attached :image
has_many :cart_items, dependent: :destroy
has_many :order_items, dependent: :restrict_with_error
validates :title, presence: true
validates :price, presence: true, numericality: { greater_than: 0 }
validate :image_type_and_size

private
def image_type_and_size
    return unless image.attached?
    
    unless image.content_type.in?(%w[image/jpeg image/png image/webp])
      errors.add(:image, "L'immagine deve essere in formato JPEG, PNG o WebP.")
    end
    if image.byte_size > 5.megabytes
      errors.add(:image, "L'immagine non può superare i 5 MB.")
    end
end
end
