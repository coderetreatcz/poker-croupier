require 'player_strategy'

class Croupier::PlayerStrategy < Croupier::ThriftObserver

  def initialize(strategy, transport)
    super(strategy, transport)
  end

  def hole_card(card)
    strategy.hole_card(gateway[card])
  end

end