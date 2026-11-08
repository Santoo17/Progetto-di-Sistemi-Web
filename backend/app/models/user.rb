class User < ApplicationRecord
    has_secure_password
    has_one :cart, dependent: :destroy
    has_many :orders, dependent: :destroy
    enum :role, { user: 0, admin: 1 }

    before_validation {self.email = email.downcase.strip}

    validates :name, presence: true
    validates :email, presence: true, uniqueness: true
    validates :password, presence: true, length: { minimum: 8 }
end
