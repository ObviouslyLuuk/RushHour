class Controller {
  constructor() {
    this.position = {x: null, y: null}
    this.start_pos = {x: null, y: null}

    this.draw_type = "target"
  }

  init_buttons() {
    document.getElementById("speed_slider").oninput = function() {
      let time_step = this.value*this.value*2
      document.value.engine.changeTimeStep(1000/time_step)
      document.value.controller.adjust_speed_slider(time_step, false)
    }

    document.getElementById("info_btn").onclick = function() {
      let div = document.getElementById("info_div")
      let display = div.style.display
      if (display == 'none') {
        div.style.display = 'block'
      } else {
        div.style.display = 'none'
      }
    }
    document.getElementById("close_info_btn").onclick = function() {
      document.getElementById("info_div").style.display = 'none'
    }

    document.getElementById("reset_btn").onclick = function() {
      document.value.game.reset()
      document.value.engine.update()
    }

    document.getElementById("undo_btn").onclick = function() {
      document.value.game.world.undo_move()
      document.value.engine.update()
    }

    document.getElementById("save_map_btn").onclick = function() {
      let object = document.value.game.world.setup
      document.value.controller.download(object, "rushhour_setup")
    }

    document.getElementById("load_map_btn").oninput = function(input_event) {
      if(!window.FileReader) return // Browser is not compatible

      let reader = new FileReader()
  
      reader.onload = function(load_event) {
        if(load_event.target.readyState != 2) return

        if(load_event.target.error) {
            alert('Error while reading file')
            return
        }  
        let map = JSON.parse(load_event.target.result)

        document.value.game.world.setup = map
        document.value.game.world.reset()
        document.value.engine.update()
      }
  
      reader.readAsText(input_event.target.files[0])

      this.value = null // Changes file to null so you can upload the same file again
    }

    document.getElementById("auto_btn").onclick = function() {
      let time_step
      if (document.value.game.state == "auto") {
        document.value.game.state = "play"
        document.value.controller.buttons_pressed([])
        time_step = 0.001
        document.value.engine.changeTimeStep(1000/time_step, false, true)
        document.value.engine.update()
      } else {
        document.value.game.state = "auto"
        document.value.controller.buttons_pressed(["auto_btn"])
        time_step = 10
        document.value.engine.changeTimeStep(1000/time_step, false, true)
      }
      document.value.controller.adjust_speed_slider(time_step, false)
    }

    document.getElementById("draw_btn").onclick = function() {
      document.value.controller.buttons_pressed([])
      if (document.value.game.state == "draw") {
        document.value.game.state = "play"
        document.value.controller.toggle_draw(false)
      } else {
        document.value.game.state = "draw"
        document.value.controller.toggle_draw(true)
      }
    }

    for (let type of ["wall", "target", "car"]) {
      document.getElementById(`draw_${type}_btn`).onclick = function() {
        document.value.game.state = "draw"
        document.value.controller.draw_type = type
        document.value.controller.buttons_pressed([])
        document.value.controller.toggle_draw(true)
      }
    }

    document.getElementById("draw_dropdown").addEventListener('mouseover', function() {
      document.getElementById("draw_hover_div").style.display = "grid"
    })
    document.getElementById("draw_dropdown").addEventListener('mouseout', function() {
      document.getElementById("draw_hover_div").style.display = "none"      
    })

    document.getElementById("tracks_dropdown").addEventListener('mouseover', function() {
      document.getElementById("tracks_hover_div").style.display = "grid"
    })
    document.getElementById("tracks_dropdown").addEventListener('mouseout', function() {
      document.getElementById("tracks_hover_div").style.display = "none"      
    })
    document.getElementById("default_track_btn").onclick = function() {
      document.value.game.world.set_default_map()
    }

    for (let i of [1,2,3,4]) {
      document.getElementById(`track${i}_btn`).onclick = function() {
        let track = JSON.parse(document.value.game.tracks[i-1])
        document.value.game.world.set_map(track)
      }
    }

    document.getElementById("clear_btn").onclick = function() {
      if (document.value.game.state == "draw") {
        document.value.game.world.map = {walls: [], targets: []}
      } else {
        console.log("To clear map drawing must be enabled")
      }
    }
  }

  adjust_speed_slider(time_step, lock) {
    let slider = document.getElementById("speed_slider")
    slider.value = Math.sqrt(time_step*.5)
    if (lock) { slider.disabled = true }
    else      { slider.disabled = false }
    document.getElementById("fps").innerHTML = time_step.toFixed(0)
  }

  init_settings() {
    this.settings_update_values()

    document.getElementById("set_default_btn").onclick = function() {
      document.value.game.set_default_settings()
    }

    document.getElementById("episode_limit").onchange = function() {
      document.value.game.max_steps = this.value
    }
    document.getElementById("target_score").onchange = function() {
      document.value.game.score_at_target = parseInt(this.value)
    }
    document.getElementById("collision_score").onchange = function() {
      document.value.game.score_at_wall = parseInt(this.value)
    }        
    document.getElementById("friction").onchange = function() {
      document.value.game.world.friction = this.value
    }
    document.getElementById("lap_length").onchange = function() {
      document.value.game.world.lap_length = this.value
      document.value.game.world.set_default_map()
    }
    document.getElementById("load_best_btn").onclick = function() {
      document.value.game.load_best()
    }

    document.getElementById("invert_speed").onchange = function() {
      document.value.game.invert_speed = this.checked
    }
    document.getElementById("target_timeout").onchange = function() {
      document.value.game.no_target_time = this.value
    }    
    document.getElementById("force_forward").onchange = function() {
      document.value.game.force_forward = this.value
    }
    document.getElementById("force_forward_player").onchange = function() {
      document.value.game.force_forward_player = this.checked
    }
    document.getElementById("forward_bias").onchange = function() {
      document.value.game.forward_bias = this.value
    }
    document.getElementById("auto_set_best").onchange = function() {
      document.value.game.auto_set_best = this.value
    }
    document.getElementById("auto_adjust_eta").onchange = function() {
      document.value.game.auto_adjust_eta = this.value
    }
    document.getElementById("auto_adjust_epsilon").onchange = function() {
      document.value.game.auto_adjust_epsilon = this.value
    }
    document.getElementById("printing").onchange = function() {
      document.value.game.printing = this.checked
    }

  }

  settings_update_values() {
    document.getElementById("episode_limit").value = document.value.game.max_steps
    document.getElementById("target_score").value = document.value.game.score_at_target
    document.getElementById("collision_score").value = document.value.game.score_at_wall
    document.getElementById("friction").value = document.value.game.world.friction
    document.getElementById("lap_length").value = document.value.game.world.lap_length

    document.getElementById("invert_speed").checked = document.value.game.invert_speed
    document.getElementById("target_timeout").value = document.value.game.no_target_time
    document.getElementById("force_forward").value = document.value.game.force_forward
    document.getElementById("force_forward_player").checked = document.value.game.force_forward_player
    document.getElementById("forward_bias").value = document.value.game.forward_bias
    document.getElementById("auto_set_best").value = document.value.game.auto_set_best
    document.getElementById("auto_adjust_eta").value = document.value.game.auto_adjust_eta
    document.getElementById("auto_adjust_epsilon").value = document.value.game.auto_adjust_epsilon
    document.getElementById("printing").checked = document.value.game.printing
  }

  toggle_draw(turn_on) {
    let draw_type = document.value.controller.draw_type
    document.getElementById(`draw_${draw_type}_btn`).setAttribute('class', "btn btn-primary")
    if (turn_on) {
      document.getElementById(`draw_btn`).setAttribute('class', "btn btn-primary")
      document.getElementById("draw_buttons_div").style.display = "grid"
      document.getElementById("content_top_right_bar_div").style["grid-template-columns"] = "auto auto auto auto"

      let time_step = 25
      document.value.engine.changeTimeStep(1000/time_step, false, true)
      document.value.controller.adjust_speed_slider(time_step, true)
    } else {
      document.getElementById("draw_buttons_div").style.display = "none"
      document.getElementById("content_top_right_bar_div").style["grid-template-columns"] = "auto auto auto"

      document.value.engine.changeTimeStep(null, true, false)
      let time_step = 1000/document.value.engine.time_step
      document.value.controller.adjust_speed_slider(time_step, false)      
    }
    document.value.game.reset()
  }

  buttons_pressed(buttons) {
    let pressable_buttons = [
      "auto_btn", "draw_btn", "draw_wall_btn", "draw_target_btn", "draw_car_btn",
    ]
    for (let button_id of pressable_buttons) {
      document.getElementById(button_id).setAttribute('class', "btn")
    }      
    for (let button_id of buttons) {
      document.getElementById(button_id).setAttribute('class', "btn btn-primary")
    }
    // document.value.controller.toggle_draw(false) // The draw button uses a different function
  }  

  init_play() {
    // Left-click down to drag a piece
    document.getElementById("map_canvas").addEventListener('mousedown', function(event) {
      let position = document.value.controller.position
      document.value.controller.start_pos = position

      let game = document.value.game
      let display = document.value.display
      let ratio = game.world.height / display.context.map.canvas.offsetHeight
      game.world.select_piece(
        Math.floor(position.x * ratio),
        Math.floor(position.y * ratio),
      )
    })
    // Set position of controller when moving mouse over the canvas
    document.getElementById("map_canvas").addEventListener('mousemove', function(event) {
      document.value.controller.position = {
        x: event.offsetX,
        y: event.offsetY,
      }

      // Render if piece selected
      let game = document.value.game
      let display = document.value.display
      let piece = game.world.selected_piece
      if (!piece) return

      display.drawPieces(game.world.pieces, game.world.selected_piece, game.world.height)
      display.render()
    })
    // Left-click up to make a move
    window.addEventListener('mouseup', function(event) {
      let game = document.value.game
      let display = document.value.display
      let piece = game.world.selected_piece
      if (!piece) return

      let position = document.value.controller.position
      let orie = piece.orientation
      let dist = position[orie] - document.value.controller.start_pos[orie]
      dist = Math.round(
        dist * game.world.height / display.context.map.canvas.offsetHeight
      )
      document.value.controller.start_pos = position
      game.world.move_piece(dist)

      display.updateStats(game)
      display.drawPieces(game.world.pieces, game.world.selected_piece, game.world.height)
      display.render()
    })
  }

  download(object, filename) {
    let string = JSON.stringify(object)
    let hidden_element = document.createElement('a')
  
    hidden_element.href = "data:attachment/text," + encodeURI(string)
    hidden_element.target = '_blank'
    hidden_element.download = `${filename}.txt`
    hidden_element.click()
  }
}