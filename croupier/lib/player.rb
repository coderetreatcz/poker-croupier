class Croupier::Player
  delegate_all :strategy

  attr_accessor :stack
  attr_reader :hole_cards

  attr_accessor :total_bet
  attr_reader :strategy

  def initialize(strategy)
    @strategy = strategy
    @stack = 1000
    @forced_bet = nil

    initialize_round
  end

  def initialize_round
    @active = has_stack?
    @total_bet = 0
    @hole_cards = []
  end

  def has_stack?
    @stack > 0
  end

  def deposit(amount)
    @stack += amount
  end

  def active?
    @active
  end

  def fold
    @active = false
  end

  def allin?
    @stack == 0
  end

  def force_bet bet
    @forced_bet = bet
  end

  def bet_request(game_state, in_action, pot, limits)
    bet = @forced_bet || @strategy.bet_request(game_state, in_action, pot, limits)
    @forced_bet = nil
    bet
  end

  def hole_card card
    @strategy.hole_card card
    @hole_cards << card
  end

  def data
    {
        name: name,
        stack: @stack,
        status: status,
        bet: @total_bet,
        hole_cards: @hole_cards.map { |card| card.data },
    }
  end

  def status
    if out? then
      "out"
    elsif active?
      "active"
    else
      "folded"
    end
  end

  def out?
    @stack + @total_bet == 0
  end
end