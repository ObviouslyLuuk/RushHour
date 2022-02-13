window.addEventListener("load", function(event) {

  "use strict";

    ///////////////////
   //// FUNCTIONS ////
  ///////////////////

  var keyDownUp = function(event) {
    // controller.keyDownUp(event.type, event.keyCode)
  }

  var resize = function(event) {
    display.resize(document.documentElement.clientWidth - 32, document.documentElement.clientHeight - 32, game.world.height / game.world.width)
    display.render()
  }

  var render = function() {

    display.updateStats(game)
    // display.updateGraph(game)

    display.drawMap(game.world.grid, game.world.exit)
    display.drawPieces(game.world.pieces, game.world.selected_piece, game.world.height)

    display.render()
 
  }

  var update = function() {

    if (game.state == "auto") {
      auto_update()
    }

  }

  function draw_update() {
    if (controller.del) { game.world.remove_from_map(controller.position) }
  }

  function auto_update() {
    let mode = "random"
    if (mode == "random") {

      let all_pieces = Object.values(game.world.pieces)
      // Only use movable pieces
      let pieces = []
      for (let piece of all_pieces) {
        if (game.prevent_double && game.world.moves.length > 1 &&
            piece.id == game.world.moves[game.world.moves.length-1].id) {
          continue
        }
        if (piece.movable) pieces.push(piece)
      }
      // Go back
      if (pieces.length < 1) {
        let move = game.world.moves[game.world.moves.length-1]
        game.world.selected_piece = game.world.pieces[move.id]
        game.world.move_piece(-move.dist)
        return
      }
      let piece = pieces[Math.floor(Math.random()*pieces.length)]
      game.world.selected_piece = piece
      let max_dist = piece.max - piece[piece.orientation]
      let min_dist = piece.min - piece[piece.orientation]
      let dists = []
      for (let i = min_dist; i <= max_dist; i++) {
        if (i == 0) continue
        dists.push(i)
      }
      let dist = dists[Math.floor(Math.random()*dists.length)]
      game.world.move_piece(dist)
    } else if (mode == "deterministic") {

      let all_pieces = Object.values(game.world.pieces)
      // Only use movable pieces
      let pieces = []
      for (let piece of all_pieces) {
        if (piece.movable) pieces.push(piece)
      }
      let piece = pieces[Math.floor(Math.random()*pieces.length)]
      game.world.selected_piece = piece
      let max_dist = piece.max - piece[piece.orientation]
      let min_dist = piece.min - piece[piece.orientation]
      let dists = []
      for (let i = min_dist; i <= max_dist; i++) {
        if (i == 0) continue
        dists.push(i)
      }
      let dist = dists[Math.floor(Math.random()*dists.length)]
      game.world.move_piece(dist)
    }

    if (game.world.won) game.world.reset()
  }

    /////////////////
   //// OBJECTS ////
  /////////////////

  var display    = new Display()
  var controller = new Controller()
  var game       = new Game()
  var engine     = new Engine(1000/0.001, render, update)

  document.value = {
    display: display,
    controller: controller,
    game: game,
    engine: engine,
  }  

    ////////////////////
   //// INITIALIZE ////
  ////////////////////

  display.buffer.map.canvas.height = game.world.height * 100
  display.buffer.map.canvas.width = game.world.width * 100
  display.context.map.canvas.height = game.world.height * 100
  display.context.map.canvas.width = game.world.width * 100

  resize()

  controller.init_buttons(game)
  controller.init_settings()
  controller.init_play()
  controller.adjust_speed_slider(1000/engine.time_step, false)
  // display.graph = display.initGraph()

  engine.start()


  window.addEventListener("keydown", keyDownUp)
  window.addEventListener("keyup",   keyDownUp)
  window.addEventListener("resize",  resize)

})