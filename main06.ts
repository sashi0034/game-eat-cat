
let canvas;
let context;
let gameLoopTimer;
let curPosX = 0;
let curPosY = 0;

const CLICK_NONE = -1, CLICK_RIGHT = 0;
let mouseState = -1;

let images: Images;

let playerName: string="";
let gameState: number=0;
let gameScore: number=0;

const KEY_USE = ['w', 'a', 's', 'd', 'Enter'];
let isKeyDown = {};


const GAME_BREAK = -1;
const GAME_PLAYING=0;
const GAME_OVER=1;

const ROUGH_SCALE = 3;
const ROUGH_WIDTH = 416;
const ROUGH_HEIGHT = 240;
const SCREEN_WIDTH = ROUGH_SCALE*ROUGH_WIDTH;
const SCREEN_HEIGHT = ROUGH_SCALE*ROUGH_HEIGHT;

const COL_ICON = 1 << 0;


//let socket = new WebSocket('ws://127.0.0.1:5006');
let socket = new WebSocket('ws://49.212.155.232:5006');
let isSocketConnect: boolean = false;



window.onload = function() {
    canvas = document.getElementById("canvas1");
    if ( canvas.getContext ) {
        context = canvas.getContext("2d");
        context.imageSmoothingEnabled = this.checked;
        context.mozImageSmoothingEnabled = this.checked;
        context.webkitImageSmoothingEnabled = this.checked;
        context.msImageSmoothingEnabled = this.checked;

        Sprite.init();
        images = new Images();

        SceneChage.init();
        SceneChage.toTitle();
        
        document.onmousemove = onMouseMove;   // マウス移動ハンドラ
        document.onmouseup = onMouseUp;       // マウスアップハンドラ
        document.onmousedown = onMouseDown;   // マウスダウンハンドラ

        onKeyInit();
        document.addEventListener("keypress", onKeyDown); // キーボード入力
        document.addEventListener("keyup", onKeyUp);


    }
}




// 接続
socket.addEventListener('open',function(e){
    isSocketConnect=true;
    console.log('Socket connection succeeded');
    scoresWrite()
});

socket.addEventListener('message',function(e){
    let d=e.data+"";
    console.log("received: "+d);
    let dat=d.split(',');

    let s=`<div class="center">[ SCORE RANKING ]<br></div>`;
    const size=15;
    for (let i=0; i<size; i++)
    {
        let n=(i+1)+"";
        s+=`<span class="rankorder">${n.padStart(2, '0')}</span>`;
        s+=`<span class="rankname">${dat[size+i]==""?"ANONYMOUS":dat[size+i]}</span>`;
        s+=`<span class="score-number">${dat[i]}</span><br>`
    }
    let par1 = document.getElementById("scores");
    par1.innerHTML = s;

    let par2 = document.getElementById("plays");
    par2.innerHTML = `このゲームは計 ${dat[size*2]} 回プレイされました`

});


function checkForm($this)
{
    let str: string=$this.value;
    while(str.match(/[^A-Z^a-z\d\-\_]/))
    {
        str=str.replace(/[^A-Z^a-z\d\-\_]/,"");
    }
    $this.value=str.toUpperCase().substr(0, 16);
    playerName = $this.value;
}


function onMouseMove( e ) {
    curPosX = e.clientX;
    curPosY = e.clientY;
    let pos = clientToCanvas( canvas, curPosX, curPosY );
    curPosX = pos.x + window.pageXOffset;
    curPosY = pos.y + window.pageYOffset;
}

function onKeyInit() {
    for (let i=0; i<KEY_USE.length; i++)
    {
        isKeyDown[KEY_USE[i]] = false;
    }
}

function onKeyDown(e) {
    //console.log(e.key);
    for (let i=0; i<KEY_USE.length; i++)
    {
        let c = KEY_USE[i];
        if (e.key === c || e.key === c.toUpperCase())
        {
            isKeyDown[c] = true;
        }
    }
}

function onKeyUp ( e ){
    for (let i=0; i<KEY_USE.length; i++)
    {
        let c = KEY_USE[i];
        if (e.key === c || e.key === c.toUpperCase())
        {
            isKeyDown[c] = false;
        }
    }
}



function onMouseKey( e ) {
    mouseState = -1;
}


function onMouseDown( e ) {
    mouseState = e.button;
}

function onMouseUp( e ) {
    mouseState = -1;
}


function clientToCanvas(canvas, clientX, clientY) {
    let cx = clientX - canvas.offsetLeft + document.body.scrollLeft;
    let cy = clientY - canvas.offsetTop + document.body.scrollTop;
    //console.log(clientY , canvas.offsetTop , document.body.scrollTop);
    let ret = {
        x: cx,
        y: cy
    };
    return ret;
}




class Images
{
    explode: number = Graph.loadGraph("./images/explode_32x32.png");;
    star: number=Graph.loadGraph("./images/stars_24x24.png");
    floorTile = Graph.loadGraph("./images/magma_tile_24x24.png");
    grassTile = Graph.loadGraph("./images/grass_tile_24x24.png");
    bush = Graph.loadGraph("./images/objet_bush_48x16.png");
    mush = Graph.loadGraph("./images/mush_16x16.png");
    skull = Graph.loadGraph("./images/skull_24x24.png");
    mouse = Graph.loadGraph("./images/mouse_24x24.png");
    wall = Graph.loadGraph("./images/block_brown_72x72.png");
    fruit = Graph.loadGraph("./images/fruit1201_16x16.png");
    warp = Graph.loadGraph("./images/warps_24x24.png");
    smoke = Graph.loadGraph("./images/smoke_32x32.png");
    obtainShot = Graph.loadGraph("./images/blinkstar_16x16.png");

    punicat = Graph.loadGraph("./images/punicat_24x24.png");
    punicatIce = Graph.loadGraph("./images/punicat_ice_24x24.png");
    punicatGohst = Graph.loadGraph("./images/punicat_gohst_24x24.png");
    exclamation = Graph.loadGraph("./images/exclamation_mark_24x24.png");
    cautionTile = Graph.loadGraph("./images/caution_tile_24x24.png");
    icingTile = Graph.loadGraph("./images/cat_tile_24x24.png");
}



class SceneChage
{
    static init()
    {
        gameLoopTimer = setInterval( function(){},16);
    }
    static toMain()
    {
        clearInterval(gameLoopTimer);
        Main.setup();
        gameLoopTimer = setInterval( Main.loop, 16 );
    }
    static toTitle()
    {
        clearInterval(gameLoopTimer);
        Title.setup();
        gameLoopTimer = setInterval( Title.loop, 16 );
    }
    
}




//タイトル
class Title
{
    static setup()
    {
        new Scroll();
        new UiTexts();
        new FieldMap();
        new BackGraphic();
        
        new TitleUi();
        gameState = GAME_BREAK;
    }
    static loop()
    {
        Sprite.allUpdate();
        Sprite.allDrawing();    
        if ((mouseState==0 && Useful.between(curPosX,0,SCREEN_WIDTH) && Useful.between(curPosY,0,SCREEN_HEIGHT)) ||
            isKeyDown['Enter']) 
        {
            Sprite.allClear(true);
            Sound.playSoundFile("./sounds/startPush.mp3");
            SceneChage.toMain();
        }
    }
}

class TitleUi
{
    constructor()
    {
        let sp=Sprite.make();
        Sprite.belong(sp, this);
        Sprite.drawing(sp, this.drawing);
        Sprite.offset(sp, 0 , 0, -4096);
        Useful.drawStringInit();
    }
    drawing(x,y)
    {
        Useful.drawStringEdged(108*ROUGH_SCALE, SCREEN_HEIGHT/2-24, "PUSH 'Enter' TO START THE GAME");
    }
}


//ページ内にスコアランキングを表示する
function scoresWrite()
{
    let send: string="";
    send += gameScore.toString()+",";
    send += playerName;
    if (isSocketConnect)socket.send(send);
}




//メインループ
class Main
{
    static count=0;
    static finishCount=0;
    static level=0;
    static levelUpTime = 120;
    static showLevelUpTime = 0;

    static setup()
    {
        new Scroll();
        new UiTexts();
        //new FieldMap();
        new BackGraphic();
        new Player();
        new Cardinal();

        Sound.playSoundFile("./sounds/game_start.mp3");
    }

    static loop() 
    {
        context.clearRect( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT );
        Sprite.allUpdate();
        Sprite.allDrawing();

        Main.count++;
        switch(gameState)
        {
            case GAME_PLAYING:
                {
                    //if (Main.count%12==0) gameScore++;
                    break;
                }
            case GAME_OVER:
                {
                    Main.finishCount++;
                    if (Main.finishCount>60*4)
                    {
                        scoresWrite();
                        Sprite.allClear(true);
                        SceneChage.toTitle();
                        return;
                    }
                    break;
                }
        }
    }


}










// テスト用
class Test
{
    sp: number;
    y: number;
    count: number;

    constructor()
    {
        this.sp = Sprite.make(images.mouse, 0, 0, 24, 24);
        this.y=0
        this.count = 0;
        Sprite.offset(this.sp, 0,0, -1000);
        Sprite.belong(this.sp, this);
        Sprite.update(this.sp, this.update); 
    }
    update(hSp)
    {
        let self: this = Sprite.getBelong(hSp);
        
        self.y=self.y+1;
        Sprite.offset(self.sp, self.y, self.y);
    }
}







// テンプレ
class Templa
{
    sp: number;
    time: number;

    constructor()
    {
        this.sp = Sprite.make(-1,0,0,16,16);
        this.time = 0;
        Sprite.offset(this.sp, 0,0, 0);
        Sprite.belong(this.sp, this);
        Sprite.update(this.sp, this.callUpdate); 
    }
    callUpdate(hSp)
    {
        let self: this=Sprite.getBelong(hSp); self.update();
    }
    update()
    {

    }
}


// プレイヤー
class Player
{
    sp: number;
    x: number;
    y: number;
    matX: number=0;
    matY: number=0;

    direction: number=Direction.DOWN;
    animTime = 0;
    time = 0;
    speed = 2;
    onWarpPoint = false;
    icingTime = 0;
    icingKill = 0;
    immortalTime = 0;

    constructor()
    {
        Player.own=this;
        let self: this = this;
        self.sp = Sprite.make(images.mouse, 0, 0, 24, 24);
        self.x = 24;
        self.y = 24;
        self.immortalTime = 120;
        Sprite.offset(self.sp, 0,0, 0);
        Sprite.link(self.sp, Scroll.own.sp);
        Sprite.belong(self.sp, self);
        Sprite.update(self.sp, self.update); 
    }
    private update(hSp)
    {
        let self: this=Sprite.getBelong(hSp);

        if (gameState==GAME_OVER)
        {// ゲームオーバーになってたら
            Sprite.image(self.sp, -1,0,0,0,0);
            return;
        }

        if (self.icingTime>0) 
        {
            self.icingTime--;
            if (self.icingTime%20==0 && self.icingTime%60!=0) Sound.playSoundFile("./sounds/icing.mp3");
        }

        self.move();

        Sprite.offset(self.sp, self.x, self.y-4);
        self.matX = (self.x+12)/24;
        self.matY = (self.y+12)/24;
        self.time++;
    }
    private move()
    {
        let self: this = this;

        let toX = -Number(isKeyDown['a'])+isKeyDown['d']
        let toY = -Number(isKeyDown['w'])+isKeyDown['s']
        if (toX!=0 && toY!=0) toX = 0;

        for (let i=0; i<self.speed; i++)
        {
            const del = 0; // 動ける範囲の大きさ(今回は無効)
            let h1 = false, h2 = false, h0 = false; // 壁判定用フラグ

            if (toX < 0) 
            {
                h1 = FieldMap.canMove(self.x+toX+del, self.y+del);
                h2 = FieldMap.canMove(self.x+toX+del, self.y+23-del);
                h0 = FieldMap.canMove(self.x+toX+del, self.y+12);
            }    
            else if (toX > 0) 
            {
                h1 = FieldMap.canMove(self.x+toX+23-del, self.y+del);
                h2 = FieldMap.canMove(self.x+toX+23-del, self.y+23-del);
                h0 = FieldMap.canMove(self.x+toX+23-del, self.y+12);
            }
            else if (toY<0)
            {
                h1 = FieldMap.canMove(self.x+del, self.y+toY+del);
                h2 = FieldMap.canMove(self.x+23-del, self.y+toY+del);
                h0 = FieldMap.canMove(self.x+12, self.y+toY+del);
            }
            else if (toY>0)
            {
                h1 = FieldMap.canMove(self.x+del, self.y+toY+23-del);
                h2 = FieldMap.canMove(self.x+23-del, self.y+toY+23-del);
                h0 = FieldMap.canMove(self.x+12, self.y+toY+23-del);
            }
            
            if (h0)
            {
                // 反映
                if (h1 || h2) 
                {
                    self.x += toX;
                    self.y += toY;
                }

                // 角をヌルっと曲がる
                if (toX!=0 && h1 && !h2) self.y += -Math.abs(toX);
                if (toX!=0 && !h1 && h2) self.y += Math.abs(toX);
                if (toY!=0 && h1 && !h2) self.x += -Math.abs(toY);
                if (toY!=0 && !h1 && h2) self.x += Math.abs(toY);
            }
        }


        
        {
            let x=(self.x+12)/24|0;
            let y=(self.y+12)/24|0;

            if (FieldMap.check(x, y, [Mapchip.WARP]))
            {// ワープ
                if (!this.onWarpPoint)
                {
                    let x1: number, y1: number;
                    [x1, y1] = Warps.nextXY(x, y);
                    self.x = x1*24; self.y = y1*24;
                    Effect.Smoke.generate(self.x-4, self.y-4);
                    Sound.playSoundFile("./sounds/warp.mp3");
                }
                this.onWarpPoint = true;
            }
            else
            {
                this.onWarpPoint = false;
            }

            if (FieldMap.check(x, y, [Mapchip.ICING]))
            {// アイシング
                Useful.remove(FieldMap.own.matrix[x][y], Mapchip.ICING);
                this.icingTime = 60*10;
                Effect.Star.generate(x*24, y*24, 0);
                this.icingKill = 0;
                Sound.playSoundFile("./sounds/ice_obtain.mp3");
            }


            if (FieldMap.check(x, y, [Mapchip.FRUIT]))
            {// フルーツ
                Useful.remove(FieldMap.own.matrix[x][y], Mapchip.FRUIT);
                Effect.DiffuseBall.generate(self.x+4, self.y+4);
                gameScore += 10;
                Sound.playSoundFile("./sounds/eat2.mp3");
            }
        }



        // アニメ
        if (toX!=0 || toY!|0 || this.animTime%60!=0)
        {
            if (toX!=0 || toY!|0) self.direction = Direction.toDir(toX, toY);
            self.animTime+=self.speed;
        }
        else
        {
            self.animTime = 0;
        }
        {
            let c=(self.animTime%60)/15|0;
            Sprite.image(self.sp, images.mouse, c*24, ((self.direction+2)%4)*24, 24, 24);
        }

        if (self.immortalTime>0)
        {// 無敵モード
            self.immortalTime--;
            if (self.immortalTime%6<3) Sprite.image(this.sp, -1, 0, 0, 0, 0);
        }
    }

    


    static own: Player;
}



// 背景
class BackGraphic
{
    sp;
    floorLayer: FloorLayer;
    wallLayer: WallLayer;
    time = 0;

    constructor()
    {
        BackGraphic.own = this;
        let self: this = this;
        self.sp=Sprite.make();
        Sprite.belong(self.sp, this)
        Sprite.update(self.sp, this.update);
        Sprite.drawing(self.sp, this.drawing);
        Sprite.offset(self.sp, 0,0, 4000);
        Sprite.link(self.sp, Scroll.own.sp);

        this.floorLayer = new FloorLayer(4096);
        this.wallLayer = new WallLayer(64);
    }
    update(hSp)
    {
        let self: this = Sprite.getBelong(hSp);

        self.time++;
    }

    drawing(hSp, hX, hY)
    {
        // 設計間違えたからz座標が反映されないので後で修正
        
        let self: this = Sprite.getBelong(hSp);

        self.floorLayer.drawing(hX, hY);
        self.wallLayer.drawing(hX, hY);
        
    }

    static own: BackGraphic;

}


// マップチップレイヤー
class MapchipLayer
{
    sp: number;


    constructor(z: number)
    {
        let self: this = this;

        self.sp = Sprite.make();
        Sprite.offset(self.sp, 0, 0, z);
        Sprite.belong(self.sp, self);
       
        //Sprite.update(self.sp, self.update); 
    }

    /*
    update(hSp)
    {
        let self: this=Sprite.getBelong(hSp);   
    }
    */

    drawing(hX, hY)
    {
        let unit = 24;
        let self: this=this;

        let hx = hX/ROUGH_SCALE|0;
        let hy = hY/ROUGH_SCALE|0;

        let x0 = ((-hx /unit) | 0) - (-hX<0 ? 1: 0); // 後半は切り捨てに注意して
        let y0 = ((-hy /unit) | 0) - (-hY<0 ? 1: 0);
        //console.log(x0, y0);

        for (let x=x0; x<=x0+((ROUGH_WIDTH/unit)|0)+1; x++)
        {
            for (let y=y0; y<=y0+((ROUGH_HEIGHT/unit)|0)+1; y++)
            {
                let mapX = x*unit, mapY = y*unit; // マップ上ラフ座標
                let screenX = (hx|0)+mapX, screenY = (hy|0)+mapY; // スクリーン上ラフ座標

                self.chipDrawing(x, y, screenX*ROUGH_SCALE, screenY*ROUGH_SCALE);
            }
        }
    }

    protected chipDrawing(x, y, sx, sy)
    {
    }
}

class WallLayer extends MapchipLayer
{
    constructor(z)
    {
        super(z);
    }

    protected chipDrawing(x, y, sx, sy)
    {
        if (!Useful.between(x, 0, FieldMap.own.width-1) || !Useful.between(y, 0, FieldMap.own.height-1)) return;

        let c: Array<number> = FieldMap.own.matrix[x][y];
        
        EdgedMapchp.process(images.wall, true, x, y, sx, sy, Mapchip.WALL, [Mapchip.WALL]);
    }
}

class FloorLayer extends MapchipLayer
{
    constructor(z)
    {
        super(z);
    }

    protected chipDrawing(x, y, sx, sy)
    {
        if (!Useful.between(x, 0, FieldMap.own.width-1) || !Useful.between(y, 0, FieldMap.own.height-1)) 
        {
            let c=Math.abs(((BackGraphic.own.time/20)|0)+x+y)%4;
            
            Graph.drawGraph(sx, sy, c*24, 0, 24, 24, images.grassTile, ROUGH_SCALE);
            return;
        }

        let c: Array<number> = FieldMap.own.matrix[x][y];

        Graph.drawGraph(sx, sy, 0, 0, 24, 24, images.floorTile, ROUGH_SCALE);

        if (FieldMap.check(x, y, [Mapchip.FRUIT])) Graph.drawGraph(sx+4*ROUGH_SCALE, sy+4*ROUGH_SCALE, 0, 0, 24, 24, images.fruit, ROUGH_SCALE);
        if (FieldMap.check(x, y, [Mapchip.WARP])) 
        {
            let c=(BackGraphic.own.time%96)/16|0;
            Graph.drawGraph(sx, sy, c*24, 0, 24, 24, images.warp, ROUGH_SCALE);
        }
        if (FieldMap.check(x, y, [Mapchip.ICING])) 
        {
            let c=(BackGraphic.own.time%112)/16|0;
            Graph.drawGraph(sx, sy, c*24, 0, 24, 24, images.icingTile, ROUGH_SCALE);
        }

    }
}




// マップチップ
class Mapchip
{
    static readonly FLOOR=0;
    static readonly WALL=1;
    static readonly FEED=2;
    static readonly FRUIT = 3;
    static readonly WARP = 4;
    static readonly ICING = 5;

    static readonly Flag = 
    {
        DIG: -1,
    }
}



// フィールド情報
class FieldMap
{
    matrix: Array<number>[][];
    originMatrix: Array<number>[][];
    width: number;
    height: number;

    constructor()
    {
        FieldMap.own = this;
        this.width = 81;
        this.height = 81;

        // 初期化
        this.originMatrix = new Array();
        for (let x=0; x<this.width; x++) {
            this.originMatrix[x] = new Array();
            for (let y=0; y<this.height; y++)
            {
                this.originMatrix[x][y] = new Array();
                this.originMatrix[x][y].push(Mapchip.FLOOR);
            }
        }
        this.matrix = new Array();
        for (let x=0; x<this.width; x++) {
            this.matrix[x] = new Array();
            for (let y=0; y<this.height; y++)
            {
                this.matrix[x][y] = new Array();
                this.matrix[x][y].push(Mapchip.FLOOR);
            }
        }

        MazeGenerator.trigger();

        /*
        this.matrix[1][1].push(Mapchip.WALL);
        this.matrix[2][1].push(Mapchip.WALL);
        this.matrix[3][1].push(Mapchip.WALL);
        this.matrix[4][1].push(Mapchip.WALL);
        this.matrix[2][2].push(Mapchip.WALL);
        this.matrix[5][5].push(Mapchip.WALL);
        */
    }

    // matrixに指定文字が存在するか調べる
    // 範囲外をfalse
    static check(x, y, target: number[]): boolean
    {
        if (x<0 || y<0 || x>=this.own.width || y>=this.own.height) return false;

        for (let i=0; i<target.length; i++)
        {
            if (this.own.matrix[x][y].includes(target[i])) return true;
        }
        return false;
    }

    // 範囲外をtrue
    static check2(x, y, target: number[]): boolean
    {
        if (x<0 || y<0 || x>=this.own.width || y>=this.own.height) return true;
        
        for (let i=0; i<target.length; i++)
        {
            if (this.own.matrix[x][y].includes(target[i])) return true;;
        }
        return false;
    }

    static canMove(x, y): boolean
    {
        return (!this.check(x/24|0, y/24|0, [Mapchip.WALL]));
    }





    static own: FieldMap;
}


class Warps
{
    x: number;
    y: number;

    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
    
    static findIndex(x: number, y: number)
    {
        for (let i=0; i<this.points.length; i++)
        {
            if (x==this.points[i].x && y==this.points[i].y)
            {
                return i;
            }
        }
        return -1;
    }
    static nextIndex(x, y)
    {
        return (this.findIndex(x, y)+1)%this.points.length;
    }
    static nextXY(x, y): [number, number]
    {
        let p=this.nextIndex(x, y);
        return [this.points[p].x, this.points[p].y];
    }

    static points: Array<Warps>;
}

class Rooms
{
    x: number;
    y: number;

    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
    
    static startPoints: Array<Rooms>;
}




// エッジ処理付きマップ描画
class EdgedMapchp
{
    static process(srcImage: number, hasConner: boolean, mapX: number, mapY: number, screenX: number, screenY: number, subjective: number, objectives: number[])
    {
        let unit = 24;

        if (FieldMap.check(mapX, mapY, [subjective]))
        {
            let left: boolean = FieldMap.check(mapX-1, mapY, objectives);
            let right: boolean = FieldMap.check(mapX+1, mapY, objectives);
            let up: boolean = FieldMap.check(mapX, mapY-1, objectives);
            let down: boolean = FieldMap.check(mapX, mapY+1, objectives);

            let con = (Number(left)<<3)+(Number(right)<<2)+
                (Number(up)<<1)+(Number(down)<<0);
                
            switch (con)
            {
                case 0:                
                {
                    Graph.drawGraph(screenX, screenY, 0, 0, unit/2, unit/2, srcImage, ROUGH_SCALE);
                    Graph.drawGraph(screenX + unit/2*ROUGH_SCALE, screenY, unit*2+unit/2, 0, unit/2, unit/2, srcImage, ROUGH_SCALE);
                    Graph.drawGraph(screenX, screenY + unit/2*ROUGH_SCALE, 0, unit*2+unit/2, unit/2, unit/2, srcImage, ROUGH_SCALE);
                    Graph.drawGraph(screenX + unit/2*ROUGH_SCALE, screenY + unit/2*ROUGH_SCALE, unit*2+unit/2, unit*2+unit/2, unit/2, unit/2, srcImage, ROUGH_SCALE);
                    break;
                }
                case 1:
                {
                    Graph.drawGraph(screenX, screenY, 0, 0, unit/2, unit, srcImage, ROUGH_SCALE);
                    Graph.drawGraph(screenX+unit/2*ROUGH_SCALE, screenY, unit*2+unit/2, 0, unit/2, unit, srcImage, ROUGH_SCALE);
                    break;
                }
                case 2:
                {
                    Graph.drawGraph(screenX, screenY, 0, unit*2, unit/2, unit, srcImage, ROUGH_SCALE);
                    Graph.drawGraph(screenX+unit/2*ROUGH_SCALE, screenY, unit*2+unit/2, unit*2, unit/2, unit, srcImage, ROUGH_SCALE);
                    break;
                }
                case 3:
                    {
                        Graph.drawGraph(screenX, screenY, 0, unit, unit/2, unit, srcImage, ROUGH_SCALE);
                        Graph.drawGraph(screenX + unit/2*ROUGH_SCALE, screenY, unit*2+unit/2, unit, unit/2, unit, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 4:
                    {
                        Graph.drawGraph(screenX, screenY, 0, 0, unit, unit/2, srcImage, ROUGH_SCALE);
                        Graph.drawGraph(screenX, screenY + unit/2*ROUGH_SCALE, 0, unit*2+unit/2, unit, unit/2, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 5:
                    {
                        Graph.drawGraph(screenX, screenY, 0, 0, unit, unit, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 6:
                    {
                        Graph.drawGraph(screenX, screenY, 0, unit*2, unit, unit, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 7:
                    {
                        Graph.drawGraph(screenX, screenY, 0, unit, unit, unit, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 8:
                    {
                        Graph.drawGraph(screenX, screenY, unit*2, 0, unit, unit/2, srcImage, ROUGH_SCALE);
                        Graph.drawGraph(screenX, screenY + unit/2*ROUGH_SCALE, unit*2, unit*2+unit/2, unit, unit/2, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 9:
                    {
                        Graph.drawGraph(screenX, screenY, unit*2, 0, unit, unit, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 10:
                    {
                        Graph.drawGraph(screenX, screenY, unit*2, unit*2, unit, unit, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 11:
                    {
                        Graph.drawGraph(screenX, screenY, unit*2, unit, unit, unit, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 12:
                    {
                        Graph.drawGraph(screenX, screenY, unit, 0, unit, unit/2, srcImage, ROUGH_SCALE);
                        Graph.drawGraph(screenX, screenY + unit/2*ROUGH_SCALE, unit, unit*2+unit/2, unit, unit/2, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 13:
                    {
                        Graph.drawGraph(screenX, screenY, unit, 0, unit, unit, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 14:
                    {
                        Graph.drawGraph(screenX, screenY, unit, unit*2, unit, unit, srcImage, ROUGH_SCALE);
                        break;
                    }
                case 15:
                    {
                        Graph.drawGraph(screenX, screenY, unit, unit, unit, unit, srcImage, ROUGH_SCALE);
                        break;
                    }          
            }

            if (hasConner)
            {
                const v1 = unit*3;
                if (left && up && !FieldMap.check(mapX - 1, mapY - 1, objectives))
                {
                    Graph.drawGraph(screenX, screenY, 0, v1 + 0, unit/2, unit/2, srcImage,ROUGH_SCALE);
                }
                if (right && up && !FieldMap.check(mapX + 1, mapY - 1, objectives))
                {
                    Graph.drawGraph(screenX + unit/2*ROUGH_SCALE, screenY, unit/2, v1 + 0, unit/2, unit/2, srcImage,ROUGH_SCALE);
                }
                if (left && down && !FieldMap.check(mapX - 1, mapY + 1, objectives))
                {
                    Graph.drawGraph(screenX, screenY + unit/2*ROUGH_SCALE, 0, v1 + unit/2, unit/2, unit/2, srcImage,ROUGH_SCALE);
                }
                if (right && down && !FieldMap.check(mapX + 1, mapY + 1, objectives))
                {
                    Graph.drawGraph(screenX + unit/2*ROUGH_SCALE,  screenY + unit/2*ROUGH_SCALE, unit/2, v1 + unit/2, unit/2, unit/2, srcImage,ROUGH_SCALE);
                }
            }
        
        }


    }

}


// 迷路自動生成
class MazeGenerator
{
    // 生成する
    public static trigger()
    {
        // 初期化
        for (let x=0; x<FieldMap.own.width; x++)
            for (let y=0; y<FieldMap.own.height; y++)
                FieldMap.own.matrix[x][y] = [Mapchip.FLOOR, Mapchip.WALL];


        Rooms.startPoints = new Array<Rooms>(0);
        for (let i=0; i<10; i++)
        {// 5*5 の部屋の作成
            let toX, toY;
            while(true)
            {// 部屋を作れる場所を探す
                toX = 2 + (Useful.rand(((FieldMap.own.width - 1 - 4*2)/2)|0)/2|0)*2 + 1;
                toY = 2 + (Useful.rand(((FieldMap.own.height - 1 - 4*2)/2)|0)/2|0)*2 + 1;
                if (this.canDigRoom(toX-2, toY-2, 5+4, 5+4)) break;
            }
            for (let x=0; x<5; x++)
                    for (let y=0; y<5; y++)
                        FieldMap.own.matrix[toX+x][toY+y] = [Mapchip.FLOOR];

            Rooms.startPoints.push(new Rooms(toX, toY));

            if (Useful.rand(2)==0)
            {
                FieldMap.own.matrix[toX+Useful.rand((5/2)|0)*2][toY+((5/2)|0)*2*Useful.rand(2)].push(Mapchip.Flag.DIG);
            }else{
                FieldMap.own.matrix[toX+((5/2)|0)*2*Useful.rand(2)][toY+Useful.rand((5/2)|0)*2].push(Mapchip.Flag.DIG);
            }
        }

        {// 迷路生成
            let x1 = 1, y1 = 1;
            let x2, y2;
            while (true)
            {
                if (!this.canDigCell(x1, y1))
                {
                    while(true)
                    {
                        [x2, y2] = this.digStroke(x1, y1);
                        if (x1==x2 && y1==y2) break;
                        x1=x2; y1=y2;
                    }
                }

                x1 = Useful.rand(((FieldMap.own.width-1)/2)|0)*2 + 1;
                y1 = Useful.rand(((FieldMap.own.height-1)/2)|0)*2 + 1;

                if (this.hasCompleted()) break;
            }
        }

        // ワープ箇所の設置
        Warps.points = new Array<Warps>(0);
        for (let x=1; x<FieldMap.own.width; x+=2)
        {
            for (let y=1; y<FieldMap.own.height; y+=2)
            {
                if (this.isWarpPoint(x, y)) 
                {
                    FieldMap.own.matrix[x][y].push(Mapchip.WARP);
                    Warps.points.push(new Warps(x, y));
                }
            }
        }
        for (let i=0; i<Warps.points.length; i++)
        {
            let a1=Useful.rand(Warps.points.length);
            let a2=Useful.rand(Warps.points.length);
            [Warps.points[a1], Warps.points[a2]] = [Warps.points[a2], Warps.points[a1]];
        }

        // アイシングタイルの設置
        for (let i=0; i<Rooms.startPoints.length; i++)
        {
            let x, y;
            x = Rooms.startPoints[i].x;
            y = Rooms.startPoints[i].y;
            FieldMap.own.matrix[x+2][y+2].push(Mapchip.ICING);
        }

        // フルーツの設置
        for (let x=1; x<FieldMap.own.width; x++)
        {
            for (let y=0; y<FieldMap.own.height; y++)
            {
                if (!FieldMap.check(x, y, [Mapchip.WALL, Mapchip.WARP, Mapchip.ICING]))
                {
                    FieldMap.own.matrix[x][y].push(Mapchip.FRUIT);
                }
            }
        }


        // 元のマップを保存
        for (let x=0; x<FieldMap.own.width; x++)
        {
            for (let y=0; y<FieldMap.own.height; y++)
            {
                FieldMap.own.originMatrix[x][y] = FieldMap.own.matrix[x][y].concat();
            }
        }


    }

    // 掘っていくストローク
    private static digStroke(x1, y1): [number, number]
    {
        let x2 = x1, y2 = y1;
        let angle = [0, 1, 2, 3];
        let hasRoom: boolean = false;
        Useful.shuffleArray(angle);

        for (let i=0; i<4; i++)
        {
            let x, y;
            [x, y] = Direction.toXY(angle[i]);

            if (FieldMap.check(x1+x*2, y1+y*2, [Mapchip.Flag.DIG]))
            {// 部屋作成時のフラグが存在していたら優先的に掘る
                [angle[0], angle[i]] = [angle[i], angle[0]];
                hasRoom = true;
            }
        }

        for (let i=0; i<4; i++)
        {// 壁がないなら掘る
            let x: number, y: number;
            [x, y] = Direction.toXY(angle[i]);
            if (this.canDigCell(x1+x*2, y1+y*2) || hasRoom)
            {
                FieldMap.own.matrix[x1+x*1][y1+y*1] = [Mapchip.FLOOR];
                FieldMap.own.matrix[x1+x*2][y1+y*2] = [Mapchip.FLOOR];
                x2 = x1+x*2; y2 = y1+y*2;
                break;
            }
        }
        return [x2, y2];

    }

    
    private static canDigCell(x, y): boolean
    {
        if (!Useful.between(x, 0, FieldMap.own.width-1) || !Useful.between(y, 0, FieldMap.own.height-1)) return false;

        return FieldMap.own.matrix[x][y].includes(Mapchip.WALL);
    }

    private static canDigRoom(x1: number, y1:number, width: number, height: number): boolean
    {
        for (let x=x1; x<x1+width; x+=2)
        {
            for (let y=y1; y<y1+height; y+=2)
            {
                if (!this.canDigCell(x, y)) return false;
            }
        }
        return true;
    }

    // 完成確認
    private static hasCompleted(): boolean
    {
        for (let x=1; x<FieldMap.own.width; x+=2)
        {
            for (let y=1; y<FieldMap.own.height; y+=2)
            {
                if (FieldMap.own.matrix[x][y].includes(Mapchip.WALL)) return false;
            }
        }
        return true;
    }

    private static isWarpPoint(x, y): boolean
    {
        let c = 
            Number(FieldMap.check(x-1, y, [Mapchip.WALL])) + 
            Number(FieldMap.check(x+1, y, [Mapchip.WALL])) + 
            Number(FieldMap.check(x, y-1, [Mapchip.WALL])) + 
            Number(FieldMap.check(x, y+1, [Mapchip.WALL]));
        
        if (c==3) return true;
        return false;
    }


}










class Scroll
{
    sp: number;
    x: number;
    y: number;

    private time: number;

    constructor()
    {
        Scroll.own = this;
        let self: this = this;    

        self.sp = Sprite.make();

        self.x = 64;
        self.y = 64;
        self.time = 0;

        Sprite.belong(self.sp, self);
        Sprite.update(self.sp, self.update); 
    }

    update(hSp)
    {
        let self: this=Sprite.getBelong(hSp);
        Sprite.offset(self.sp, self.x, self.y);

        if (gameState!=GAME_BREAK)
        {
            self.x = -Player.own.x+ROUGH_WIDTH/2-12;
            self.y = -Player.own.y+ROUGH_HEIGHT/2-12;
        }
        else
        {
            self.x-=0.1;
            self.y-=0.1;
            if (self.x<-FieldMap.own.width*24-24*8) self.x=64;
            if (self.y<-FieldMap.own.height*24-24*8) self.y=64;
        }


        self.time++;
    }

    static own: Scroll;
}



// 猫ちゃん
class PuniCat
{
    sp: number;
    x: number;
    y: number;
    direction: number=0;

    immovableTime = 0;
    cautionTime = 0;
    gohstTime = 0;

    exclaimationSp: number;
    exclaimationTime: number=0;

    // 行列上での座標
    matX: number;
    matY: number;

    // 移動量
    speed: number=2;
    moveX: number=0;
    moveY: number=0;
    
    movableWay: number=0;
    onWarpPoint: boolean = false;

    time: number=0;

    constructor(matX: number, matY: number)
    {
        this.sp = Sprite.make();
        this.matX = matX;
        this.matY = matY;
        this.x = matX*24;
        this.y = matY*24;
        
        Sprite.offset(this.sp, 0,0, 0);
        Sprite.link(this.sp, Scroll.own.sp);
        Sprite.belong(this.sp, this);
        Sprite.update(this.sp, this.callUpdate); 
        
        // ビックリマーク
        this.exclaimationSp = Sprite.make();
        Sprite.image(this.exclaimationSp, images.exclamation, 0, 0, 24, 24);
        Sprite.link(this.exclaimationSp, this.sp);
        Sprite.offset(this.exclaimationSp, 0, -12, -800);
    }

    private callUpdate(hSp): void
    {
        let self: this=Sprite.getBelong(hSp); self.update();
    }

    private update()
    {
        this.move();
        this.animation();
        this.collide();

        Sprite.offset(this.sp, this.x, this.cautionTime==0 ? this.y-4 : this.y);

        this.time++;
    }

    
    private animation()
    {
        if (this.cautionTime==0)
        {// 通常
            if (Player.own.icingTime==0 && this.gohstTime==0)
            {// 通常
                let c=(this.time%40)/10|0;
                Sprite.image(this.sp, images.punicat, c*24, ((this.direction+2)%4)*24, 24, 24);
            }
            else if (this.gohstTime==0)
            {// アイス中
                let c=(this.time%60)/15|0;
                Sprite.image(this.sp, images.punicatIce, c*24, ((this.direction+2)%4)*24, 24, 24);
                if (Player.own.icingTime<90 && Player.own.icingTime%12<6)
                {
                    Sprite.image(this.sp, images.punicat, c*24, ((this.direction+2)%4)*24, 24, 24);
                }
            }
            else
            {// ゴースト
                let c=(this.time%60)/15|0;
                Sprite.image(this.sp, images.punicatGohst, c*24, ((this.direction+2)%4)*24, 24, 24);
            }
        }
        else
        {// ワープ中の注意喚起
            let c=(this.time%20)/10|0;
            Sprite.image(this.sp, images.cautionTile, c*24, 0, 24, 24);
            this.cautionTime--;
        }

        // ビックリマーク
        if (this.exclaimationTime>0)
        {
            Sprite.blendPal(this.exclaimationSp, 255);
            this.exclaimationTime--;
        }
        else 
        {
            Sprite.blendPal(this.exclaimationSp, 0);
        }

    }

    // 衝突判定
    private collide()
    {

        if (this.cautionTime>0) return;
        if (this.gohstTime>0) {this.gohstTime--; return;}

        let hit = Hit.hitRectRect(
            this.x, this.y, 24, 24,
            Player.own.x+4, Player.own.y+4, 24-8, 24-8);
        
        if (hit)
        {
            if (Player.own.icingTime==0)
            {// 通常
                if (Player.own.immortalTime==0 && gameState!=GAME_OVER)
                {
                    Effect.Explosion.generate(Player.own.x, Player.own.y, 0);
                    gameState = GAME_OVER;
                    Sound.playSoundFile("./sounds/game_over.mp3");
                }
            }
            else
            {//アイス中なら
                Effect.Explosion.generate(this.x-4, this.y-4, 1);
                Effect.Star.generate(this.x, this.y, 0);
                this.gohstTime = 60*15;
                this.immovableTime=3*60;

                Player.own.icingKill++;
                gameScore+= Player.own.icingKill*1000;

                Sound.playSoundFile("./sounds/pac.mp3");
            }
        }
    }



    private move()
    {
        if (this.cautionTime>0) return;
        if (this.immovableTime>0){this.immovableTime--; return;}

        if (Player.own.icingTime>0) this.exclaimationTime = 0;

        this.speed = Player.own.speed;
        let speed = this.speed;
        if (Player.own.icingTime>0 || this.gohstTime>0) speed = Math.max((speed)/2|0, 1);

        for (let i=0; i<speed; i++)
        {
            if (this.moveX!=0)
            {
                this.x += 1*Math.sign(this.moveX); this.moveX-=1*Math.sign(this.moveX);
            }
            if (this.moveY!=0)
            {
                this.y += 1*Math.sign(this.moveY); this.moveY-=1*Math.sign(this.moveY);
            }
            if (this.moveX==0 && this.moveY==0)
            {// 移動予定量完了
                this.matX = this.x/24|0; this.matY = this.y/24|0;
                this.x = this.matX*24; this.y = this.matY*24;
                let warped = this.onWarpPoint;
                
                if (Player.own.icingTime==0 && this.gohstTime==0) 
                    {this.destinate();}
                else 
                    {this.weakDestinate();}

                if (!warped && this.onWarpPoint) break;
            }

        }
    }


    private destinate()
    {
        // ワープ
        if (FieldMap.check(this.matX, this.matY, [Mapchip.WARP]))
        {
            if (!this.onWarpPoint)
            {
                let x1: number, y1: number;
                [x1, y1] = Warps.nextXY(this.matX, this.matY);
                this.matX = x1; this.matY = y1;
                this.x = x1*24; this.y = y1*24;
                this.onWarpPoint=true;
                if (this.exclaimationTime==0) this.cautionTime = 60;
                return;
            }
            this.onWarpPoint=true;
        }
        else
        {
            this.onWarpPoint=false;
        }

        {
            let dirBefore = this.direction;
            
            let x: number, y: number;
            [x, y]=Direction.toXY(this.direction);

            
            // 左右のチェックをする
            let a1 = Useful.mod(this.direction-1, 4);
            let a2 = Useful.mod(this.direction+1, 4);
            if (Useful.rand(2)==0) [a1, a2]=[a2, a1];
            let b1: boolean, b2: boolean, b0: boolean;
            {
                let x1, y1; [x1, y1] = Direction.toXY(a1);
                b1 = !FieldMap.check(this.matX+x1, this.matY+y1, [Mapchip.WALL]);
            }
            {
                let x1, y1; [x1, y1] = Direction.toXY(a2);
                b2 = !FieldMap.check(this.matX+x1, this.matY+y1, [Mapchip.WALL]);
            }
            {
                let x1, y1; [x1, y1] = Direction.toXY(this.direction);
                b0 = !FieldMap.check(this.matX+x1, this.matY+y1, [Mapchip.WALL]);
            }

            if (!FieldMap.check(this.matX+x, this.matY+y, [Mapchip.WALL]))
            {// まっすぐ進めるとき

                if (Useful.rand(4)>0)
                {
                    if (1+Number(b1)+Number(b2)>this.movableWay)
                    {// 分岐点が前フレームより増えたら
                        if (b1)
                        {// 進行方向の左右が空いてたら方向転換
                            this.direction=a1;
                        }
                        else if (b2)
                        {
                            this.direction=a2;
                        }
                    }
                }
             
            }
            else 
            {// まっすぐ進めない時
                if (b1) this.direction = a1;
                else if (b2) this.direction = a2;
                else this.direction = (this.direction+2)%4;
            }

            // プレイヤーがいるか一応確認
            if (b0 && this.tracePlayer(this.matX, this.matY, dirBefore, 8))
            {
                this.direction = dirBefore; this.exclamation();
            }
            else if (b1 && this.tracePlayer(this.matX, this.matY, a1, 8)) 
            {
                this.direction = a1; this.exclamation();
            }
            else if (b2 && this.tracePlayer(this.matX, this.matY, a2, 8)) 
            {
                this.direction = a2; this.exclamation();
            }

            let toX=0, toY=0;
            [toX, toY] = Direction.toXY(this.direction);
            if (!FieldMap.check(this.matX+toX, this.matY+toY, [Mapchip.WALL]))
            {
                this.moveX += toX*24;
                this.moveY += toY*24;   
                this.movableWay = 1+Number(b1)+Number(b2); // 後で上のifの中に入れとくかも
            }

            return;
        }
        
    }

    private weakDestinate()
    {
        // ワープ
        if (FieldMap.check(this.matX, this.matY, [Mapchip.WARP]))
        {
            if (!this.onWarpPoint)
            {
                let x1: number, y1: number;
                [x1, y1] = Warps.nextXY(this.matX, this.matY);
                this.matX = x1; this.matY = y1;
                this.x = x1*24; this.y = y1*24;
                this.onWarpPoint=true;
                if (this.exclaimationTime==0) this.cautionTime = 60;
                return;
            }
            this.onWarpPoint=true;
        }
        else
        {
            this.onWarpPoint=false;
        }

        {
            let dirBefore = this.direction;
            
            let x: number, y: number;
            [x, y]=Direction.toXY(this.direction);

            
            // 左右のチェックをする
            let a1 = Useful.mod(this.direction-1, 4);
            let a2 = Useful.mod(this.direction+1, 4);
            let a3 = Useful.mod(this.direction+2, 4);
            if (Useful.rand(2)==0) [a1, a2]=[a2, a1];
            let b1: boolean, b2: boolean, b3: boolean, b0: boolean;
            {
                let x1, y1; [x1, y1] = Direction.toXY(a1);
                b1 = !FieldMap.check(this.matX+x1, this.matY+y1, [Mapchip.WALL]);
            }
            {
                let x1, y1; [x1, y1] = Direction.toXY(a2);
                b2 = !FieldMap.check(this.matX+x1, this.matY+y1, [Mapchip.WALL]);
            }
            {
                let x1, y1; [x1, y1] = Direction.toXY(a3);
                b3 = !FieldMap.check(this.matX+x1, this.matY+y1, [Mapchip.WALL]);
            }
            {
                let x1, y1; [x1, y1] = Direction.toXY(this.direction);
                b0 = !FieldMap.check(this.matX+x1, this.matY+y1, [Mapchip.WALL]);
            }

            if (!FieldMap.check(this.matX+x, this.matY+y, [Mapchip.WALL]))
            {// まっすぐ進めるとき

                if (Useful.rand(4)>0)
                {
                    if (1+Number(b1)+Number(b2)>this.movableWay)
                    {// 分岐点が前フレームより増えたら
                        if (b1 && !this.tracePlayer(this.matX, this.matY, a1, 8))
                        {// 進行方向の左右が空いてたら方向転換
                            this.direction=a1;
                        }
                        else if (b2 && !this.tracePlayer(this.matX, this.matY, a2, 8))
                        {
                            this.direction=a2;
                        }
                    }
                }
            }
            else 
            {// まっすぐ進めない時
                if (b1 && !this.tracePlayer(this.matX, this.matY, a1, 8)) this.direction = a1;
                else if (b2  && !this.tracePlayer(this.matX, this.matY, a2, 8)) this.direction = a2;
                else if (b3) this.direction = a3;
            }

            // プレイヤーがいるか一応確認
            if (b3 && this.tracePlayer(this.matX, this.matY, dirBefore, 8))
            {
                this.direction = a3;
            }

            let toX=0, toY=0;
            [toX, toY] = Direction.toXY(this.direction);
            if (!FieldMap.check(this.matX+toX, this.matY+toY, [Mapchip.WALL]))
            {
                this.moveX += toX*24;
                this.moveY += toY*24;   
                this.movableWay = 1+Number(b1)+Number(b2); // 後で上のifの中に入れとくかも
            }

            return;
        }
        
    }



    // プレイヤー追跡
    private tracePlayer(x, y, direction, count): boolean
    {
        if (count<0) return false;
        if (FieldMap.check(x, y, [Mapchip.WALL])) return false;

        if (Hit.hitRectRect(x*24, y*24, 24,24, Player.own.x, Player.own.y, 24,24))
        {
            return true;
        }

        let x1, y1;
        [x1, y1]=Direction.toXY(direction);
        return this.tracePlayer(x+x1, y+y1, direction, count-1);
    }

    // ビックリマーク
    private exclamation()
    {
        if (this.exclaimationTime != 30)
        {
            this.exclaimationTime = 30;
            Sound.playSoundFile("./sounds/exclaim.mp3");
        }
        return;
    }


}



class Hit
{
    static hitRectRect(
        x1: number, y1: number, width1: number, height1: number,
        x2: number, y2: number, width2: number, height2: number)
    {
        return true && 
            Math.abs(x2+width2/2.0-(x1+width1/2.0)) < (width1+width2)/2.0 && 
            Math.abs(y2+height2/2.0-(y1+height1/2.0)) < (height1+height2)/2.0;
    }
}






class Effect
{
    static Explosion = class Explosion
    {
        sp: number;
        x: number;
        y: number;
        count: number;
        type: number;

        constructor(x, y,type)
        {
            this.x=x;
            this.y=y;
            this.count=0;
            this.type=type;
            this.sp=Sprite.make(images.explode, 0, 0, 32, 32);
            
            Sprite.link(this.sp, Scroll.own.sp);
            Sprite.offset(this.sp, x, y, -1000);
            Sprite.belong(this.sp, this);
            Sprite.update(this.sp, this.update);
        }
        update(hSp)
        {
            let self: this=Sprite.getBelong(hSp);

            let temp=5;
            {
                let c=((self.count%(temp*6))/temp) | 0;
                Sprite.image(self.sp,images.explode, c*32, self.type*32, 32, 32);    
            }
            self.count++;
            if (self.count>(temp*6*4))
            {
                Sprite.clear(self.sp);
            }
        }
        static generate(x,y,type)
        {
            new Effect.Explosion(x-16,y-16,type);
            new Effect.Explosion(x+16,y-16,type);
            new Effect.Explosion(x-16,y+16,type);
            new Effect.Explosion(x+16,y+16,type);
        }
    }

    static Smoke = class Smoke
    {
        sp: number;
        x: number;
        y: number;
        count: number;

        constructor(x, y)
        {
            this.x=x;
            this.y=y;
            this.count=0;
            this.sp=Sprite.make(images.smoke, 0, 0, 32, 32);
            
            Sprite.link(this.sp, Scroll.own.sp);
            Sprite.offset(this.sp, x, y, -2000);
            Sprite.belong(this.sp, this);
            Sprite.update(this.sp, this.update);
        }
        update(hSp)
        {
            let self: this=Sprite.getBelong(hSp);

            let temp=5;
            {
                let c=((self.count%(temp*4))/temp) | 0;
                Sprite.image(self.sp,images.smoke, c*32, 0, 32, 32);    
            }
            self.count++;
            if (self.count>(temp*4*2))
            {
                Sprite.clear(self.sp);
            }
        }
        static generate(x,y)
        {
            new Smoke(x-16,y-16);
            new Smoke(x+16,y-16);
            new Smoke(x-16,y+16);
            new Smoke(x+16,y+16);
        }
    }

    static DiffuseBall = class DiffuseBall
    {
        sp: number;
        x: number;
        y: number;
        theta: number;
        design: number;
        time=0;

        constructor(x, y, theta, design)
        {
            let self: this = this;
            self.sp = Sprite.make(images.obtainShot, 0, 0, 16, 16);
            self.x = x;
            self.y = y;
            self.theta = theta;
            self.design = design;
            Sprite.link(self.sp, Scroll.own.sp);
            Sprite.offset(self.sp, x, y, 800);
            Sprite.belong(self.sp, self);
            Sprite.update(self.sp, self.update);
        }
        update(hSp)
        {
            let self: this=Sprite.getBelong(hSp);
            self.x += Math.cos(self.theta)*3;
            self.y += Math.sin(self.theta)*3;
            self.theta += Math.PI/180*24;
            
            self.time++;
            if (self.time>45)
            {
                Sprite.clear(self.sp);return;
            }
            if (self.time>20)
            {
                Sprite.blendPal(self.sp, (45-self.time)*(255/25));
            }
            
            Sprite.offset(self.sp, self.x, self.y);
            Sprite.image(self.sp, images.obtainShot, ((self.time%60)/20|0)*16, self.design*16, 16, 16);
        }
        static generate(x: number, y:number)
        {
            for (let i=0; i<4; i++)
            {
                new DiffuseBall(x, y, Math.PI*2*(i/4), i%2);
            }
        }

    }

    static Star=class
    {
        sp:number;
        count: number;
        x: number;
        y: number;
        vx: number;
        vy: number;

        constructor(type, x,y,vx,vy)
        {
            this.count = 0;
            this.x=x;
            this.y=y;
            this.vx=vx; 
            this.vy=vy;
            this.sp = Sprite.make(images.star, type*24,0,24,24);
            Sprite.link(this.sp, Scroll.own.sp);
            Sprite.offset(this.sp, x,y,-2000);
            Sprite.belong(this.sp, this);
            Sprite.update(this.sp, this.update); 
        }
        update(hSp)
        {
            let self: this=Sprite.getBelong(hSp);

            self.x+=self.vx;
            self.y+=self.vy;
            self.vy += 0.2;
            Sprite.offset(self.sp, self.x, self.y);
            self.count++;
            if (self.count>180) {Sprite.clear(self.sp);return;}
        }
        static generate(x, y, type)
        {
            for (let i=-6; i<=6; i++)
            {
                let ang=(-90+i*15)/180*Math.PI;
                let vx=Math.cos(ang)*2;
                let vy=Math.sin(ang)*2-4;

                new Effect.Star((type==0) ? Math.abs(i%2) : 2,x,y,vx,vy);
            }
        }
    
    }
}










class UiTexts
{
    constructor()
    {
        let sp=Sprite.make();
        Sprite.belong(sp, this);
        Sprite.drawing(sp, this.drawing);
        Sprite.offset(sp, 0 , 0, -4096);
        Useful.drawStringInit();
    }
    drawing(hSp, hX, hY)
    {
        UiTexts.baseText();
        
        if (gameState==GAME_OVER)
        {
            Useful.drawStringEdged(160*ROUGH_SCALE, SCREEN_HEIGHT/2-24*3, "G A M E  O V E R");
        }
        if (gameState==GAME_PLAYING)
        {
            if (Main.showLevelUpTime>0)
            {
                Useful.drawStringEdged(172*ROUGH_SCALE, SCREEN_HEIGHT/2-24*3, "L E V E L  U P");
                Main.showLevelUpTime--;
            }
        }
    }
    static baseText()
    {
        Useful.drawStringEdged(...Useful.xyToRough([0,ROUGH_HEIGHT-18]), `Score: ${gameScore}`);
        {
            let t=`Level: ${Main.level}`
            if (Main.level>=9) t="Level: ∞"
            Useful.drawStringEdged(...Useful.xyToRough([356,ROUGH_HEIGHT-16-18]),t);
        }
        {
            let t=`Next: ${Main.levelUpTime}`
            if (Main.level>=9) t="Next: ∞"
            Useful.drawStringEdged(...Useful.xyToRough([356,ROUGH_HEIGHT-18]),t);
        }
    }

}





// ゲームバランス調整
class Cardinal
{
    sp: number;
    time: number;

    constructor()
    {
        this.sp = Sprite.make();
        this.time = 0;
        Sprite.offset(this.sp, 0,0, 0);
        Sprite.belong(this.sp, this);
        Sprite.update(this.sp, this.callUpdate); 

        gameScore = 0;
        Main.level = 1;
        Main.levelUpTime = 120;
        gameState = GAME_PLAYING;
        gameScore=0;
        Main.count=0;
        Main.finishCount=0;

        // 猫の配置
        for (let i=0 ;i<20; i++)
        {
            while(true)
            {
                let x=Useful.rand2(1, FieldMap.own.width);
                let y=Useful.rand2(1, FieldMap.own.height);
                if (!FieldMap.check(x, y, [Mapchip.WALL, Mapchip.WARP]))
                {
                    new PuniCat(x, y);
                    break;
                }
            }
        }
        
    }
    callUpdate(hSp)
    {
        let self: this=Sprite.getBelong(hSp); self.update();
    }
    update()
    {
        if (gameState == GAME_PLAYING && Main.level<9 && this.time%60==0)
        {
            Main.levelUpTime--;
            if (Main.levelUpTime==0)
            {// レベルアップ
                Main.level++;
                if (Main.level%2==1) 
                {
                    Player.own.speed +=1;
                    // 元のマップを復元
                    for (let x=0; x<FieldMap.own.width; x++)
                    {
                        for (let y=0; y<FieldMap.own.height; y++)
                        {
                            FieldMap.own.matrix[x][y] = FieldMap.own.originMatrix[x][y].slice();
                        }
                    }
                }
                
                gameScore += 1;
                


                Main.levelUpTime=120;
                Main.showLevelUpTime = 60*2;

                for (let i=0; i<20; i++)
                {
                    let p = Warps.points[Useful.rand(Warps.points.length)];
                    let x = p.x, y = p.y;

                    let cat: PuniCat = new PuniCat(x, y);
                    cat.cautionTime = 180;
                }

                Sound.playSoundFile("./sounds/level_up.mp3");
            }
        }

        this.time++;
    }
}


















// お役立ちクラス
class Useful
{
    static drawStringInit()
    {
        context.font = "48px 'Impact'";
        context.lineWidth = "8";
        context.lineJoin = "miter";
        context.miterLimit = "5"
    }

    static drawStringEdged(x, y, text, inColor="#fff")
    {
        y+=48;
        context.strokeText(text, x, y);
        context.fillStyle = inColor
        context.fillText(text, x, y);

    }

    static rand(n)
    {
        return (Math.random()*n) | 0;
    }
    static rand2(min, max)
    {
        return min+this.rand(max-min);
    }
    static between(n, min, max)
    {
        return (min<=n && n <= max);
    }
    static isString(obj) {
        return typeof (obj) == "string" || obj instanceof String;
    };

    static toInt(n: number): number
    {
        return n|0;
    }

    static xyToRough(arr: [number, number]): [number, number]
    {
        for (let i=0; i<arr.length; i++)
        {
            arr[i]*=ROUGH_SCALE;
        }
        return arr;
    }
    static boxToRough(arr: [number, number, number, number]): [number, number, number, number]
    {
        for (let i=0; i<arr.length; i++)
        {
            arr[i]*=ROUGH_SCALE;
        }
        return arr;
    }

    static shuffleArray(arr: Array<any>)
    {
        for (let i=0; i<arr.length*2; i++)
        {
            let a = this.rand(arr.length);
            let b = this.rand(arr.length);
            [arr[a], arr[b]] = [arr[b], arr[a]]
        }
    }

    static remove(arr: Array<any>, target: any)
    {
        let i=arr.indexOf(target);
        if (i>-1) arr.splice(i, 1);
    }

    static mod(n: number, m: number)
    {
        let ret = n%m;
        return ret<0 ? ret+m : ret;
    }
}


// 4方向
class Direction
{
    static readonly UP = 0;
    static readonly RIGHT = 1;
    static readonly DOWN = 2;
    static readonly LEFT = 3;

    static toXY(ang: number): [number, number]
    {
        let ret: [number, number];
        switch(ang)
        {
            case this.UP:
                ret = [0,-1];break;
            case this.RIGHT:
                ret = [1, 0];break;
            case this.DOWN:
                ret = [0, 1];break;
            case this.LEFT:
                ret = [-1, 0];break;
        }
        return ret;
    }

    static toDir(x: number, y: number): number
    {
        // atan2の定義域は-pi~pi
        let theta = Math.atan2(y, x);

        if (Useful.between(theta, -Math.PI/4, Math.PI/4))
        {
            return this.RIGHT;
        }
        else if (Useful.between(theta, -Math.PI*3/4, -Math.PI/4))
        {
            return this.UP;
        }
        else if (Useful.between(theta, Math.PI/4, Math.PI*3/4))
        {
            return this.DOWN;
        }
        else
        {
            return this.LEFT;
        }
    }

}










class SpriteCompornent
{
    isUsed: boolean = false;
    x: number = 0;
    y: number = 0;
    image: number = -1;
    u: number = 0;
    v: number = 0;
    width: number = 0;
    height: number = 0;
    isReverse: boolean = false;
    isProtect: boolean=false;
    
    link: number = -1;

    blendPal: number = 1.0;

    belong: any = null;
    
    updateMethod: (hSp) => void = function(hSp){};
    drawingMethod: (hSp, hX, hY)=>void = Sprite.DrawingProcess.rough;

    constructor()
    {
    }    

}





class Sprite
{
    static SPRITE_MAX: number = 2048;
    static sprite: SpriteCompornent[];
    static sprite_Z: Array<Array<number>> = []

    static nextNum: number=0;
    static roughScale: number = 3;

    static init()
    {
        this.sprite = new Array(this.SPRITE_MAX);
        this.sprite_Z = [];
        for(let i=0; i<this.SPRITE_MAX; i++)
        {
            this.sprite[i] = new SpriteCompornent();
            this.sprite_Z.push([i, 0]);
        }

        console.log("Sprite init succeeded");
    }

    static make(image=-1, u=0, v=0, w=16, h=16): number
    {
        for(let i=0; i<this.SPRITE_MAX; i++)
        {
            let sp=(this.nextNum+i) % this.SPRITE_MAX;

            if(this.sprite[sp].isUsed==false)
            {
                this.sprite[sp] = new SpriteCompornent();
                this.sprite_Z[sp][1]=0;
                this.sprite[sp].isUsed=true;
                this.sprite[sp].image = image;
                this.sprite[sp].u = u;
                this.sprite[sp].v = v;
                this.sprite[sp].width=w;
                this.sprite[sp].height=h;

                this.nextNum=sp+1;
                return sp;
            }
        }

        return -1;
    }

    static reverse(sp, rev=true): void
    {
        this.sprite[sp].isReverse = rev;
    }
    static image(sp, image=undefined, u=undefined, v=undefined, w=undefined, h=undefined): void
    {
        if (image!==undefined) this.sprite[sp].image = image;
        if (u!==undefined) this.sprite[sp].u = u;
        if (v!==undefined) this.sprite[sp].v = v;
        if (w!==undefined) this.sprite[sp].width = w;
        if (h!==undefined) this.sprite[sp].height = h;
    }

    static offset(sp, x, y, z=undefined): void
    {
        this.sprite[sp].x = x;
        this.sprite[sp].y = y;
        if (z!==undefined) 
        {
            this.sprite_Z[sp][1] = z;
        }
    }
    static getScreenXY(sp): Array<number>
    {
        let x=this.sprite[sp].x + this.getLinkDifference_X(sp);
        let y=this.sprite[sp].y + this.getLinkDifference_Y(sp);
        return [x, y];
    }

    static belong(sp, cls): void
    {
        this.sprite[sp].belong = cls;
    }
    static getBelong(sp) : any
    {
        return this.sprite[sp].belong;
    }

    static link(sp, link): void
    {
        this.sprite[sp].link = link
    }

    static getLinkDifference_X(sp): number
    {
        if(this.sprite[sp].link != -1){
            let spli = this.sprite[sp].link;
            return this.sprite[spli].x + this.getLinkDifference_X(spli);
        }else{
            return 0
        }
    }
    static getLinkDifference_Y(sp): number
    {
        if(this.sprite[sp].link != -1){
            let spli = this.sprite[sp].link;
            return this.sprite[spli].y + this.getLinkDifference_Y(spli);
        }else{
            return 0
        }
    }

    static blendPal(sp: number, pal256: number)
    {
        this.sprite[sp].blendPal=pal256/255;
    }

    static update(sp, func): void
    {
        this.sprite[sp].updateMethod = func;
    }
    static drawing(sp,func): void
    {
        this.sprite[sp].drawingMethod = func;
    }

    // 消去しないようにする
    static protect(sp: number, protect: boolean): void
    {
        this.sprite[sp].isProtect = protect;
    }

    static clear(sp: number, protect: boolean = false): void
    {
        if (protect && this.sprite[sp].isProtect) return; 
        this.sprite[sp].isUsed = false;
        this.nextNum = sp+1;
    }

    static allClear(protect: boolean=false)
    {
        for(let i=0; i<this.SPRITE_MAX; i++)
        {
            if (protect && this.sprite[i].isProtect) continue; 
            this.sprite[i].isUsed = false;
        }    
}


 



    static usedRate(): string
    {
        let c=0;
        for(let i=0; i<this.SPRITE_MAX; i++)
        {
            if (this.sprite[i].isUsed) c+=1;
        }
        return c+" / "+this.SPRITE_MAX;
    }


    static allUpdate(): void
    {
        for(let i=0; i<this.SPRITE_MAX; i++)
        {
            if(this.sprite[i].isUsed==true) 
            {
                this.sprite[i].updateMethod(i);
            }
        }
    }

    static allDrawing(): void
    {
        let ol = this.sprite_Z.slice();
        ol.sort(function(a, b){return b[1]-a[1]});
        for (let i in ol)
        {
            let sp = ol[i][0];
            if(this.sprite[sp].isUsed==true)
            {

                let x, y;
                if(this.sprite[sp].link!=-1)
                {
                    x=(this.sprite[sp].x + this.getLinkDifference_X(sp)) | 0;
                    y=(this.sprite[sp].y + this.getLinkDifference_Y(sp)) | 0;
                }
                else
                {
                    x=(this.sprite[sp].x) | 0
                    y=(this.sprite[sp].y) | 0
                }

                x *= this.roughScale;
                y *= this.roughScale;
                context.globalAlpha = this.sprite[sp].blendPal;
                this.sprite[sp].drawingMethod(sp, x, y);
            }

        }
    }

    static DrawingProcess = class
    {
        static rough(hSp, hX, hY)
        {
            Sprite.DrawingProcess.draw(hSp, hX, hY, Sprite.roughScale);
        }
        static dotByDot(hSp, hX, hY)
        {
            Sprite.DrawingProcess.draw(hSp, hX, hY, 1);
        }
        static draw(sp, x, y, scale)
        {
            if (Sprite.sprite[sp].image==-1) return;
            let spr=Sprite.sprite[sp];
            if (spr.isReverse) 
            {
                Graph.drawTurnGraph(x, y, spr.u, spr.v, spr.width, spr.height, spr.image, scale); 
            }
            else 
            {
                Graph.drawGraph(x, y, spr.u, spr.v, spr.width, spr.height, spr.image, scale);
            }
        }
    }


}


//グラフィック読み込み
class Graph
{
    static images={}
    static imageIndex=0;
    //画像読み込み
    static loadGraph(path)
    {
        let handler=this.imageIndex;
        this.images[handler] = new Image;
        this.images[handler].src=path;
        this.imageIndex++;
        return handler;
    }
    //描画
    static drawGraph(x, y, u, v, w, h, image, scale)
    {
        context.drawImage(this.images[image], u, v, w, h, x, y, w*scale, h*scale);
    }
    static drawTurnGraph(x, y, u, v, w, h, handle, scale)
    {
        context.save();
        context.translate(x+w*scale,y);
        context.scale(-1, 1);
        context.drawImage(this.images[handle], u, v, w, h, 0, 0, w*scale, h*scale);
        context.restore();
    }
    static drawBox(x1, y1, x2, y2, color: string, fillFlag: boolean)
    {
        x2--; y2--;
        if (fillFlag)
        {
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x1, y2);
            context.lineTo(x2, y2);
            context.lineTo(x2, y1);
            context.closePath();
            context.fill();
        }
        else
        {
            context.strokeStyle = color;
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x1, y2);
            context.lineTo(x2, y2);
            context.lineTo(x2, y1);
            context.closePath();
            context.stroke();
        }
    }

    static drawQuadrangle(x1, y1, x2, y2, x3, y3, x4, y4, color: string, fillFlag: boolean)
    {
        x2--; y2--;
        if (fillFlag)
        {
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.lineTo(x3, y3);
            context.lineTo(x4, y4);
            context.closePath();
            context.fill();
        }
        else
        {
            context.strokeStyle = color;
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.lineTo(x3, y3);
            context.lineTo(x4, y4);
            context.closePath();
            context.stroke();
        }
    }
    
}


class Sound
{
    static playSoundFile(path, vol=0.5, loop: boolean=false): HTMLAudioElement
    {
        let music: HTMLAudioElement = new Audio(path);
        music.volume=vol;
        music.loop = false;
        music.play();

        if (loop) 
        {
            music.addEventListener("ended", function () {
                music.currentTime = 0;
                music.play();
              }, false);
        }

        return music;
    }
}












