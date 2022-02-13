class Game {
  constructor() {
    this.state = "play"
    this.world = new World(this)

    this.episode_nr = 0
    this.scores = []
    this.best_moves = []
    this.improved_moves = []
    this.avg_score = Infinity

    this.prevent_double = true
  }

  won() {
    this.episode_nr++
    this.scores.push(this.world.moves.length)
    if (this.world.moves.length < this.best_moves.length || this.best_moves.length == 0) {
      this.best_moves = this.world.moves
      this.improve_moves()
    }
    this.avg_score = Math.floor(mean(this.scores))

    if (this.state == "play")
      alert("Congratulations, Puzzle Solved!")
  }

  improve_moves() {
    this.improved_moves = []
    let len = this.best_moves.length

    for (let i = 0; i < len; i++) {
      let j
      for (j = len-1; j > i; j--) {
        if (this.best_moves[i].board == this.best_moves[j].board) {
          break
        }
      }
      this.improved_moves.push(this.best_moves[i])
      i = j
    }
  }

  reset() {
    this.world.reset()
  }
}

class World {
  constructor(game, height=6, width=6, setup=MAP.default) {
    this.game = game

    this.height = height
    this.width = width
    this.setup = setup

    this.pieces = {}
    this.grid = []
    this.init_grid(height, width, setup)
    this.exit = this.pieces["A"].y

    this.update_pieces()

    this.selected_piece = null
    this.moves = []
    this.won = false
  }

  init_grid(height, width, setup) {
    this.grid = []
    this.pieces = {}
    for (let i = 0; i < height; i++) {
      this.grid[i] = []
      for (let j = 0; j < width; j++) {
        let id = setup[i*width + j]
        if (id == "o") {
          this.grid[i].push("")
          continue
        }
        this.grid[i].push(id)

        if (id == "x") continue

        if (!Object.keys(this.pieces).includes(id)) {
          let piece = new Piece(id, j, i, count_char(setup, id))
          this.pieces[id] = piece
        }
        else {
          let orientation = "y"
          let last_id = Object.keys(this.pieces).pop()
          if (id == last_id) orientation = "x"

          this.pieces[id].orientation = orientation
        }
      }
    }
  }

  update_pieces() {
    for (let piece of Object.values(this.pieces)) {
      piece.get_boundaries(this.grid)
    }
  }

  select_piece(x, y) {
    let id = this.grid[y][x]
    if (!Object.keys(this.pieces).includes(id)) return

    let piece = this.pieces[id]
    if (piece.movable) this.selected_piece = piece
  }

  move_piece(dist) {
    let piece = this.selected_piece
    this.selected_piece = null

    // Abort if move is out of bounds
    let max_dist = piece.max - piece[piece.orientation]
    let min_dist = piece.min - piece[piece.orientation]
    if (dist > max_dist)
      dist = max_dist
    else if (dist < min_dist)
      dist = min_dist

    if (dist == 0) return

    let new_pos = piece[piece.orientation] + dist

    // Update grid
    if (piece.orientation == "x") { // Horizontal
      // Remove old piece position
      for (let x = piece.x; x < piece.x + piece.length; x++) this.grid[piece.y][x] = ""
      // Add new piece position
      for (let x = new_pos; x < new_pos + piece.length; x++) this.grid[piece.y][x] = piece.id

    } else { // Vertical
      // Remove old piece position
      for (let y = piece.y; y < piece.y + piece.length; y++) this.grid[y][piece.x] = ""
      // Add new piece position
      for (let y = new_pos; y < new_pos + piece.length; y++) this.grid[y][piece.x] = piece.id
    }

    // Update piece pos
    piece[piece.orientation] = new_pos

    this.moves.push({id: piece.id, dist: dist, board: this.get_board()})
    this.update_pieces()
    this.check_win()
  }

  undo_move() {
    if (this.moves.length < 1) return

    let move = this.moves.pop()
    this.selected_piece = this.pieces[move.id]
    this.move_piece(-move.dist)
    this.moves.pop()
  }

  check_win() {
    if (this.pieces["A"].x >= this.width-2) {
      this.won = true
      this.game.won()
      return true
    }
    return false
  }

  get_board() {
    let string = ""
    for (let i of this.grid) {
      for (let j of i) {
        if (j == "") {
          string += "o"
          continue
        }
        string += j
      }
    }
    return string
  }

  reset() {
    this.selected_piece = null
    this.moves = []
    this.won = false
    this.init_grid(this.height, this.width, this.setup)
    this.update_pieces()
  }
}

class Piece {
  /**
   * 
   * @param {string} id
   * @param {number} x 
   * @param {number} y 
   * @param {number} length
   */
  constructor(id, x, y, length=1) {
    this.id = id
    this.x = x
    this.y = y
    this.length = length

    this.orientation = undefined
    this.min = undefined
    this.max = undefined
    this.movable = false
  }

  get_boundaries(grid) {
    this.movable = false
    if (this.orientation == "x") { // Horizontal
      this.min = this.x
      this.max = this.x

      let row = grid[this.y]
      for (let x = this.x-1; x >= 0; x--) {
        if (row[x] == "") {
          this.min = x
          this.movable = true
        }
        else break
      }
      for (let x = this.x + this.length; x < row.length; x++) {
        if (row[x] == "") {
          this.max = x - this.length+1
          this.movable = true
        }
        else break
      }
    } else { // Vertical
      this.min = this.y
      this.max = this.y

      for (let y = this.y-1; y >= 0; y--) {
        if (grid[y][this.x] == "") {
          this.min = y
          this.movable = true
        }
        else break
      }
      for (let y = this.y + this.length; y < grid.length; y++) {
        if (grid[y][this.x] == "") {
          this.max = y - this.length+1
          this.movable = true
        }
        else break
      }
    }
  }
}

MAP = {
  default: `IBBxooIooLDDJAALooJoKEEMFFKooMGGHHHM`
}


function count_char(string, char) {
  count = 0
  for (let c of string) {
    if (c == char) count++
  }
  return count
}

function mean(array) {
  let sum = 0
  for (let i of array) {
    sum += i
  }
  return sum/array.length
}