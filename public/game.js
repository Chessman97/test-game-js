"use strict"
window.onload=init;

var background;
var player;
var bullet;
var enemy;
var text;
var current_weapon;

var weapon_objs;
var player_obj;
var bullet_objs;
var enemy_objs;

var game_begin_x = 0;
var game_begin_y = 0;
var game_width = 900;
var game_height = 450;
var floor_width = 900;
var floor_height = 50;


//картинки
var preview_bg = create_image("images/preview_bg.jpg");
var bg = create_image("images/background.jpg");
var bg_floor = create_image("images/floor.bmp");
var player_image = create_image("images/sprite.png");
var enemy_image = create_image("images/sprite_terror.png");

var weapon={
        "awp" : create_image("images/awp_weapon.png"),
        "awp_bullet" : create_image("images/awp_bullet.png"),
        "default" : create_image("images/default_weapon.png"),
        "default_bullet" : create_image("images/bullet_right.png"),
        "ak47" : create_image("images/ak47.png"),
        "ak47_bullet" : create_image("images/bullet_right.png"),
		"winchester1887" : create_image("images/winchester1887.png"),
        "winchester1887_bullet" : create_image("images/drob.png")
        }

var coordinates_sprite;//объект с координатами спрайтов

var is_playing;
var is_lose;

var count_frames = 0;
var bullet_frequency = 82;


var params_game = {
    "score" : 0,
    "chance_occurrence" : 0.005,
    "speed_terrorist" : 1
}

var record = localStorage["record"] || 0;

var requestAnimFrame = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame;

function init()
{
	coordinates_sprite = {
		"player" : [
            [86,48],
            [390,48],
            [668,48],
            [94,422],
            [356,422],
            [647,422]
        ],
		"enemy_terrorist" : [
            [25,131],
            [419,131],
            [835,131],
            [25,667],
            [427,667],
            [833,667]
        ]
	}
	
    document.addEventListener("keydown", move, false);	//нажатие клавиши
    document.addEventListener("keyup", stop_move, false);//отпускание клавиши
	
	background = new Canvas("scene");
	player = new Canvas("player");
	bullet = new Canvas("bullet");
	enemy = new Canvas("enemy");
	text = new Canvas("text");
	
    player_obj = new Player();
    bullet_objs = [];
    enemy_objs = [];
    weapon_objs = [];
    weapon_objs.push(new Weapon("L115A3", 170, 95, false, 12, 67, true, "images/avp.mp3", 0.2, weapon.awp ,667, 134, 25, 20, 110, 30, weapon.awp_bullet, 500, 170, 120, 30, 15, 10));
    weapon_objs.push(new Weapon("Default", 20,  56, false, 7, 12, false, "images/shot.mp3", 0.2, weapon.default ,9, 9, 5, 30,0,0, weapon.default_bullet, 256, 256, 93, 25, 20, 20));
    weapon_objs.push(new Weapon("AK-47", 25, 65, false, 9,  20, true, "images/ak-47.mp3", 0.9, weapon.ak47 ,1820, 825, 25, 20,90,40, weapon.ak47_bullet, 256, 256, 100, 25, 20, 20));
	weapon_objs.push(new Weapon("Winchester 1887", 15, 5, true, 6,  52, false, "images/winchester1887.mp3", 0.2, weapon.winchester1887, 470, 169, 40, 30, 70, 30, weapon.winchester1887_bullet, 1000, 667, 98, 28, 10, 10));
    current_weapon = weapon_objs[1];
    weapon_objs[1].is_choosen = true;

    document.getElementById("list_weapon").innerHTML += "<ul>";
    for(let i = 0; i < weapon_objs.length; i++) {
        document.getElementById("list_weapon").innerHTML += "<li " + (weapon_objs[i].is_choosen ? "class='choosen' " : " ") + "data-index='" + i + "'>" + weapon_objs[i].name + "</li>";
    }
    document.getElementById("list_weapon").innerHTML += "</ul>";
    start_preview();  
}

function Weapon(name, damage, accuracy, fraction, speed_bullet, frequency_shot, penetration, path_to_sound, sound_volume, image, width_photo, height_photo, drawX, drawY,
				width_in_game, height_in_game, image_bullet, width_photo_bullet, height_photo_bullet, drawX_bullet, drawY_bullet,
				width_in_game_bullet, height_in_game_bullet)
{
    this.is_choosen = false;
    this.name = name;
    this.damage = damage;
	this.accuracy = accuracy;
	this.fraction = fraction;
    this.speed_bullet = speed_bullet;
    this.frequency_shot = frequency_shot;
    this.penetration = penetration;
    this.path_to_sound = path_to_sound;
    this.sound_volume = sound_volume;
    this.image = image;
    this.width_photo = width_photo;
    this.height_photo = height_photo;
	this.drawX = drawX;
	this.drawY = drawY;
	this.width_in_game = width_in_game;
	this.height_in_game = height_in_game;
	this.image_bullet = image_bullet;
    this.width_photo_bullet = width_photo_bullet;
    this.height_photo_bullet = height_photo_bullet;
	this.drawX_bullet = drawX_bullet;
	this.drawY_bullet = drawY_bullet;
	this.width_in_game_bullet = width_in_game_bullet;
	this.height_in_game_bullet = height_in_game_bullet;
}

function Canvas(element)
{
	this.cvs = document.getElementById(element);
	this.cvs.width = game_width;
    this.cvs.height = game_height;
	
	this.ctx = this.cvs.getContext("2d");
}

function create_image(path)
{
	let img = new Image();
	img.src = path;
	return img;
}

function Player()
{
    this.width = 100; 
    this.height = 120;
    this.drawX = 0;
    this.drawY = game_height - floor_height - this.height+22;
    this.floor = game_height - floor_height - this.height+22;
    this.drawX_end = 270;
    this.drawY_end = 350;

    this.count_frames_bullet = 0;
    

    this.wound = new Audio;
    this.wound.src = "images/player_wound.mp3"; 


    //нажата ли клавиша
    this.is_up = false;
    this.is_right = false;
    this.is_left = false;
    this.is_fire = false;


    this.max_hp = 100;
    this.hp = this.max_hp;
    this.speed = 5;
    this.jump = 11;
    this.gravitation = 0.3;
    this.for_gravitation = this.jump;
}
Player.prototype.draw = function(){
	player.ctx.clearRect(game_begin_x, game_begin_y, game_width, game_height);
	
    let index = parseInt((count_frames / 5),10) % 6;//какой кадр будет выбран
    player.ctx.drawImage(player_image, coordinates_sprite.player[index][0], coordinates_sprite.player[index][1], this.drawX_end, this.drawY_end, this.drawX, this.drawY, this.width, this.height);
    
	player.ctx.drawImage(current_weapon.image, 0, 0, current_weapon.width_photo,current_weapon.height_photo, player_obj.drawX+current_weapon.drawX,player_obj.drawY+current_weapon.drawY, current_weapon.width_in_game, current_weapon.height_in_game);


}

Player.prototype.update=function(){
    if (!this.is_right && !this.is_left){
        count_frames  =0;
    }
    if (this.is_right){
        if (this.drawY == this.floor){
            count_frames++;
        } else {
            count_frames = 0;
        }
        if (this.drawX + this.speed < 600){
            this.drawX += this.speed;
        }
    }
    if(this.is_left){
        if (!this.is_right && this.drawY == this.floor){
            count_frames++;
        } else {
            count_frames = 0;
        }
        if(this.drawX - this.speed > 0){
            this.drawX -= this.speed;
        }
    }
    //если удерживается клавиша прыжка, или мы не на земле
    if (this.is_up || this.drawY != this.floor){
        //не должны перелететь пол
        if ((this.drawY - this.for_gravitation) >= this.floor){
            this.drawY = this.floor;
            this.for_gravitation = this.jump;
            var landing = new Audio();
            landing.src = "images/landing.mp3";
            landing.volume = 0.3;
            landing.play();
        } else {
            this.drawY -= this.for_gravitation;
            this.for_gravitation -= this.gravitation;
        }

    }

    if (this.is_fire) {
        if (this.count_frames_bullet % current_weapon.frequency_shot == 0){ //условие не дающее стрелять слишком быстро
            this.add_bullet();
        }
        this.count_frames_bullet++;
    } else {
        //эта конструкция не дает игроку стрелять быстрее положенного быстрым нажатием пробела
        if (this.count_frames_bullet != 0){ 
            if (this.count_frames_bullet % current_weapon.frequency_shot != 0) {
                this.count_frames_bullet++;
            } else {
                this.count_frames_bullet = 0;
            }
        }
    }   
}

Player.prototype.add_bullet = function(){
	if (current_weapon.fraction){
		for(let i = 0; i < 9; i++) {
			bullet_objs.push(new Bullet());
		}
	} else {
		bullet_objs.push(new Bullet());
	}
    let _this = bullet_objs[bullet_objs.length - 1]
    _this.shot.play();
}

function move(e)
{
    if (e.keyCode == 87) {
        player_obj.is_up = true;
        e.preventDefault();
    }
    if (e.keyCode == 68) {
        player_obj.is_right = true;
        e.preventDefault();
    }
    if (e.keyCode == 65) {
        player_obj.is_left = true;
        e.preventDefault();
    }
    if (e.keyCode == 32) {
        player_obj.is_fire = true;
        e.preventDefault();
    }
}

function stop_move(e)
{
    if (e.keyCode == 68) {
        player_obj.is_right = false;
        e.preventDefault();
    }
    if (e.keyCode == 65) {
        player_obj.is_left = false;
        e.preventDefault();
    }
    if (e.keyCode == 87) {
        player_obj.is_up = false;
        e.preventDefault();
    }
    if (e.keyCode == 32) {
        player_obj.is_fire = false;
        e.preventDefault();
    }

}

function Bullet()
{
    this.width = current_weapon.width_in_game_bullet; 
    this.height = current_weapon.height_in_game_bullet;
    this.drawX = player_obj.drawX + current_weapon.drawX_bullet;
    this.drawY = player_obj.drawY + current_weapon.drawY_bullet;
    this.floor = game_height-floor_height - this.height + 26;
    this.drawX_end = 270;
    this.drawY_end = 350;
	
	this.bullet_right_image = current_weapon.image_bullet;
	this.bullet_left_image = create_image("images/bullet_left.png");
	
	
    this.is_bullet_terrorist = false;
    
    this.shot = new Audio; 
    this.shot.src = current_weapon.path_to_sound; 
    this.shot.volume = current_weapon.sound_volume;
    this.ak47 = new Audio; 
    this.ak47.src = "images/ak-47.mp3";
    this.ak47.volume = 0.6;


    this.deviation = (Math.random()*4 - 2)*(1-current_weapon.accuracy*0.01);
    this.frequency = 10;
    this.speed = current_weapon.speed;
}

Bullet.prototype.draw = function(){
    bullet.ctx.drawImage(this.bullet_right_image, 0, 0, current_weapon.width_photo_bullet, current_weapon.height_photo_bullet, this.drawX, this.drawY, this.width, this.height);
}
Bullet.prototype.draw_enemy = function(){
    bullet.ctx.drawImage(this.bullet_left_image, 0, 0, 256, 256, this.drawX, this.drawY, 20, 20);
}
Bullet.prototype.update = function(){
    this.drawX += current_weapon.speed_bullet;
	this.drawY += this.deviation;
}
Bullet.prototype.update_enemy = function(){
    this.drawX -= 6;
}




function Enemy()
{
    this.width = 100;
    this.height = 120;
    this.drawX = game_width + 10;
    this.drawY = game_height - floor_height - this.height + 22;
    this.floor = game_height - floor_height - this.height + 22;
    this.drawX_end = 394;
    this.drawY_end = 510;

    this.wound_with = null;

    //звуки
    this.wound = new Audio;
    this.wound.src = "images/wound.mp3"; 
    this.wound.volume = 1;
    this.kill = new Audio; 
    this.kill.src = "images/kill.mp3"; 
    this.kill.volume = 1;


    this.count_frames_enemy = 0;
    this.count_frames_bullet = 0;


    this.is_fire = false;

    this.is_up = false;

    this.chance_jump = 0.04;
    this.chance_shoot = 0.005;
    this.max_hp = 60;
    this.hp = this.max_hp;
    this.jump = 9;
    this.gravitation = 0.2;
    this.for_gravitation = this.jump;
}

Enemy.prototype.draw = function(){
	
    let index = parseInt((this.count_frames_enemy / 5), 10) % 6;
    enemy.ctx.drawImage(enemy_image, coordinates_sprite.enemy_terrorist[index][0], coordinates_sprite.enemy_terrorist[index][1], this.drawX_end, this.drawY_end, this.drawX, this.drawY, this.width, this.height);
    
    this.shoot_in_frequency();

}

Enemy.prototype.update=function()
{
    this.count_frames_enemy++;
    this.drawX -= params_game.speed_terrorist;

    if (Math.random() <= this.chance_jump){
        this.is_up = true;
    }
    if (Math.random() <= this.chance_shoot){
        this.is_fire = true;
    }
    
    if (this.is_up || this.drawY != this.floor){
        //не должны перелететь пол

        if ((this.drawY - this.for_gravitation) >= this.floor){
            this.drawY = this.floor;
            this.for_gravitation = this.jump;
            var landing = new Audio();
            landing.src = "images/landing.mp3";
            landing.volume = 0.3;
            landing.play();
        } else {
            this.drawY -= this.for_gravitation;
            this.for_gravitation -= this.gravitation;
        }
        this.is_up = false;
    }


    
    
}

Enemy.prototype.shoot_in_frequency = function(){
    if (this.is_fire) {
        if (this.count_frames_bullet % bullet_frequency==0) {
            this.add_bullet();
            this.is_fire = false;
        }
        this.count_frames_bullet++;
    } else {
        if(this.count_frames_bullet != 0){ 
            if (this.count_frames_bullet % bullet_frequency != 0) {
                this.count_frames_bullet++;
            } else {
                this.count_frames_bullet = 0;
            }
        }
    }
}

var draw_and_check_for_hit_bullets = function(){
    bullet.ctx.clearRect(game_begin_x, game_begin_y, game_width, game_height);
    for(let i = 0; i < bullet_objs.length; i++) {
        if(!bullet_objs[i].is_bullet_terrorist) {
            bullet_objs[i].draw();
            for(let j = 0; j < enemy_objs.length; j++) {
            
                if (bullet_objs[i] && enemy_objs[j]) {
                    let conditions = {
                        "check_on_left_coordinate_X" : bullet_objs[i].drawX + bullet_objs[i].width >= enemy_objs[j].drawX,
                        "check_on_right_coordinate_X" : bullet_objs[i].drawX + bullet_objs[i].width <= enemy_objs[j].drawX + enemy_objs[j].width,
                        "check_on_top_coordinate_Y" : bullet_objs[i].drawY >= enemy_objs[j].drawY, 
                        "check_on_bottom_coordinate_Y" : bullet_objs[i].drawY <= enemy_objs[j].drawY + enemy_objs[j].height
                    }
        
                    if(
                        conditions.check_on_left_coordinate_X &&
                        conditions.check_on_right_coordinate_X &&
                        conditions.check_on_top_coordinate_Y &&
                        conditions.check_on_bottom_coordinate_Y 
                    ) {
                        if(current_weapon.penetration) {
                            if(enemy_objs[j].wound_with != bullet_objs[i]) { //чтобы одна пуля не наносила урон каждым кадров при нахождении в противнике
                                enemy_objs[j].hp -= current_weapon.damage;
                            }
                            enemy_objs[j].wound_with = bullet_objs[i];//этой пулей монстр уже был поражен
                        }
                        else {
                            enemy_objs[j].hp -= current_weapon.damage;
                            bullet_objs.splice(i, 1);
                        }
                        enemy_objs[j].wound.play();
                        if (enemy_objs[j].hp <= 0) {
                            enemy_objs[j].kill.play();
                            enemy_objs.splice(j, 1);
                            params_game.score++;
                            if (Math.random() > 0.5){
                                params_game.speed_terrorist += 0.1;
                            } else {
                                params_game.chance_occurrence += 0.0005;
                            }
                        }
                    }
                }
            }
            if (bullet_objs[i] && bullet_objs[i].drawX > game_width) {
                bullet_objs.splice(i, 1);
            }
        } else {
            bullet_objs[i].draw_enemy();
            
            if (bullet_objs[i]) {
                let conditions = {
                    "check_on_right_coordinate_X" : bullet_objs[i].drawX <= player_obj.drawX + player_obj.width - 15,
                    "check_on_left_coordinate_X" : bullet_objs[i].drawX >= player_obj.drawX,
                    "check_on_top_coordinate_Y" : bullet_objs[i].drawY + bullet_objs[i].height / 2 >= player_obj.drawY, 
                    "check_on_bottom_coordinate_Y" : bullet_objs[i].drawY <= player_obj.drawY + player_obj.height
                }
        
                if (
                    conditions.check_on_left_coordinate_X &&
                    conditions.check_on_right_coordinate_X &&
                    conditions.check_on_top_coordinate_Y &&
                    conditions.check_on_bottom_coordinate_Y 
                ) {
                    bullet_objs.splice(i, 1);
                    player_obj.hp -= 20;
                    player_obj.wound.play();
                }
            }

            if(bullet_objs[i] && bullet_objs[i].drawX < 0) {
                bullet_objs.splice(i, 1);
            }
        }
    }
}

Enemy.prototype.add_bullet = function() {
    bullet_objs.push(new Bullet());
    let _this = bullet_objs[bullet_objs.length - 1]
    _this.drawX = this.drawX;
    _this.drawY = this.drawY + 25;
    _this.is_bullet_terrorist = true;
    _this.ak47.play();
}

function start_preview()
{
    clear_all();
    background.ctx.drawImage(preview_bg, 0, 0, 728, 431, game_begin_x, game_begin_y, game_width, game_height);
    let elements_in_game = document.querySelectorAll(".in_game");
    
    for(var i = 0; i < elements_in_game.length; i++){
        elements_in_game[i].style.display = "none";
    }
    let elements_preview = document.querySelectorAll(".preview");
    
    for(var i = 0; i < elements_preview.length; i++){
        elements_preview[i].style.display = "block";
    }

    let list_weapon = document.querySelectorAll("#list_weapon li");
    
    for(let i = 0; i < list_weapon.length; i++){
        list_weapon[i].addEventListener("click", function(){

            for(let j = 0; j < list_weapon.length; j++){
                list_weapon[j].classList.remove("choosen");
            }
            for(let j = 0; j < weapon_objs.length; j++){
                weapon_objs[i].is_choosen = false;
            }
            this.classList.add("choosen");
            let index = this.getAttribute("data-index");
            weapon_objs[index].is_choosen = true;
            current_weapon = weapon_objs[index];
            document.getElementById("list_weapon").classList.add("display_none");

        });
    }

    document.getElementById("choose_weapon").onclick = function() {
        document.getElementById("list_weapon").classList.toggle("display_none");
    }

    document.getElementById("start").onclick = function(){
        draw_bg();
        start_loop();
    }
}

function exit()
{
    if (confirm("Вы уверены?")) {
        stop_loop();
	    if(is_lose && record<params_game.score) {
		    record = params_game.score;
	    }
        start_preview();
    }
}

function clear_all()
{
    player.ctx.clearRect(0, 0, game_width, game_height);
    text.ctx.clearRect(0, 0, game_width, game_height);
    enemy.ctx.clearRect(0, 0, game_width, game_height);
    bullet.ctx.clearRect(0, 0, game_width, game_height);
    params_game = {
        "score" : 0,
        "chance_occurrence" : 0.005,
        "speed_terrorist" : 1
    }
    enemy_objs = [];
    bullet_objs = [];
    player_obj = new Player();
}

function loop()
{
    if(is_playing)
    {
        
        player_obj.draw();

		if (Math.random()<=params_game.chance_occurrence) {
			enemy_objs.push(new Enemy());
		}
        draw_and_check_for_hit_bullets();
        draw_player_hp();
        draw_enemy_hp();
        draw_score();
        enemy.ctx.clearRect(game_begin_x, game_begin_y, game_width, game_height);
        for(let i = 0; i < enemy_objs.length; i++){
            enemy_objs[i].draw();
            if (enemy_objs[i].drawX + enemy_objs[i].width <= 0) {
                stop_loop();
                text.ctx.fillStyle = "#ff8888";
                text.ctx.font = "bold 24px Arial";
                text.ctx.fillText("Террорист прошел и убил много мирных жителей",game_width / 2 - 300, game_height / 2 - 6);
                text.ctx.font = "bold 28px Arial";
                text.ctx.fillText("Игра окончена", game_width / 2-100, game_height / 2 + 20);
                show_record();
                is_lose = true;
            }
        }
        if(player_obj.hp <= 0) {
            stop_loop();
            text.ctx.fillStyle = "#ff8888";
            text.ctx.font = "bold 24px Arial";
            text.ctx.fillText("Вас убили",game_width / 2 - 62, game_height / 2 - 6);
            text.ctx.font = "bold 28px Arial";
            text.ctx.fillText("Игра окончена", game_width / 2-100, game_height / 2 + 20);
            show_record();
            is_lose = true;
        }
        update();
        requestAnimFrame(loop);
    }
}

function start_loop()
{
    is_playing = true;
    is_lose = false;
    let elements_preview = document.querySelectorAll('.preview');
    for(var i = 0; i < elements_preview.length; i++){
        elements_preview[i].style.display="none";
    }
    document.getElementById('list_weapon').classList.add("display_none");
    let elements_in_game = document.querySelectorAll('.in_game'); 
    for(var i = 0; i < elements_in_game.length; i++){
        elements_in_game[i].style.display = "block";
    }
    loop();
}

function stop_loop()
{
    is_playing = false;
}

function show_record()
{
    if(localStorage["record"]) {
        localStorage["record"] = localStorage["record"] > params_game.score ? localStorage["record"] : params_game.score;
    } else {
        localStorage["record"] = params_game.score;
    }
    text.ctx.fillStyle = "#99ff99";
    text.ctx.fillText("Ваш рекорд:" + localStorage["record"], game_width / 2 - 100, game_height / 2 + 48);
}

function update()
{
    player_obj.update();
    
    for(let i = 0; i < enemy_objs.length; i++) {
        enemy_objs[i].update();
    }



    for(let i = 0; i < bullet_objs.length; i++){
        if(!bullet_objs[i].is_bullet_terrorist) {
            bullet_objs[i].update();
        } else {
            bullet_objs[i].update_enemy();
        }
    }

}


function draw_score()
{
    text.ctx.fillStyle = "#ffffff";
    text.ctx.font = "bold 24px Arial";
    text.ctx.fillText("Счет:" + params_game.score, 4, 23);
    text.ctx.font = "bold 14px Arial";
    text.ctx.fillText("Рекорд:" + record, 4, 47);
}

function draw_player_hp()
{
    text.ctx.clearRect(0, 0, game_width, game_height);
    text.ctx.fillStyle = "#ff5555";
    text.ctx.fillRect(player_obj.drawX, player_obj.drawY - 34, player_obj.width * (player_obj.hp / player_obj.max_hp), 5);
    text.ctx.fillStyle = "#ffbbbb";
    text.ctx.fillRect(player_obj.drawX + player_obj.width * (player_obj.hp / player_obj.max_hp),
                    player_obj.drawY - 34,
                    player_obj.width - player_obj.width * (player_obj.hp / player_obj.max_hp),
                    5);
}

function draw_enemy_hp()
{
    for(let i = 0; i < enemy_objs.length; i++)
    {
        text.ctx.fillStyle = "#ff5555";
        text.ctx.fillRect(enemy_objs[i].drawX, 
                        enemy_objs[i].drawY - 34, 
                        enemy_objs[i].width * (enemy_objs[i].hp / enemy_objs[i].max_hp),
                        5);
        text.ctx.fillStyle = "#ffbbbb";
        text.ctx.fillRect(enemy_objs[i].drawX + enemy_objs[i].width * (enemy_objs[i].hp / enemy_objs[i].max_hp), 
                            enemy_objs[i].drawY - 34,
                            enemy_objs[i].width - enemy_objs[i].width * (enemy_objs[i].hp / enemy_objs[i].max_hp),
                            5);
    }
}

function draw_bg()
{
    background.ctx.drawImage(bg, 0, 0, 1788, 1118, game_begin_x, game_begin_y, game_width, game_height);
    background.ctx.drawImage(bg_floor, 0, 0, 1009, 94, 0, game_height - floor_height, game_width, floor_height);

}

function pause()
{
    if (!is_lose) {
        if(is_playing) {
            stop_loop();
            text.ctx.fillStyle = "#ffffff";
            text.ctx.font = "bold 30px Arial";
            text.ctx.fillText("Пауза", game_width / 2 - 40, game_height / 2 - 15);
        } else {
            start_loop();
        }
    }
}