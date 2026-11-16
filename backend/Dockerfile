FROM ruby:3.4-slim

WORKDIR /rails

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libpq-dev libyaml-dev git curl libvips && \
    rm -rf /var/lib/apt/lists/*

ENV RAILS_ENV=production \
    BUNDLE_WITHOUT="development test"

# Gem prima del codice: il layer resta in cache finché Gemfile/Gemfile.lock non cambiano
COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000

# db:prepare crea i 4 database (primary, cache, queue, cable), migra e lancia il seed solo alla prima creazione
CMD ["sh", "-c", "bin/rails db:prepare && bin/rails server -b 0.0.0.0 -p 3000"]