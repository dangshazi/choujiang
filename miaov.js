//球的半径
var radius = 500;
// 2度
var dtr = Math.PI/180;
var d=1400;
//LIst 存放的是 Tag的宽度 高度
var mcList = [];
//是否激活旋转
var active = false;
var lasta = 1;
var lastb = 1;
var distr = true;
var tspeed=100;
//var size=250;
var size=250;


var mouseX=0;
var mouseY=0;

var howElliptical=1;

var aA=null;
var oDiv=null;

//随机生成颜色
var getRandomColor = function(){
	  return '#'+(Math.random()*0xffffff<<0).toString(16); 
	}

window.onload=function ()
{
	var i=0;
	var oTag=null;
	
	oDiv=document.getElementById('div1');
	
	aA=oDiv.getElementsByTagName('a');
	
	//将所有的<a>变成Tag
	for(i=0;i<aA.length;i++)
	{
		oTag={};
		
		oTag.offsetWidth=aA[i].offsetWidth;
		oTag.offsetHeight=aA[i].offsetHeight;
		
		mcList.push(oTag);
	}
	
	sineCosine( 0,0,0 );
	//初次排放tag位置
	positionAll();
	
	//鼠标方到DIV上面就激活 开始旋转
	oDiv.onmouseover=function ()
	{
		active=true;
	};
	//鼠标离开DIV上面就激活 停止旋转
	oDiv.onmouseout=function ()
	{
		active=false;
	};
	
	oDiv.onmousemove=function (ev)
	{
		var oEvent=window.event || ev;
		//鼠标相对于 球心的x y
		mouseX=oEvent.clientX-(oDiv.offsetLeft+oDiv.offsetWidth/2);
		mouseY=oEvent.clientY-(oDiv.offsetTop+oDiv.offsetHeight/2);
		
		mouseX/=5;
		mouseY/=5;
	};
	
	//没30毫秒调用一次update函数
	setInterval(update, 30);
};

function update()
{
	var a;
	var b;
	
	if(active)
	{
		//离球心越近，速度越慢，离球心越远速度越快
		a = (-Math.min( Math.max( -mouseY, -size ), size ) / radius ) * tspeed;
		b = (Math.min( Math.max( -mouseX, -size ), size ) / radius ) * tspeed;
	}
	else
	{
		//控制停下来的加速度
		a = lasta * 0.97;
		b = lastb * 0.97;
	}
	
	lasta=a;
	lastb=b;
	
	if(Math.abs(a)<=0.01 && Math.abs(b)<=0.01)
	{
		/**
		 * //打印停止转动时所有的 cz值
		for(var j=0;j<mcList.length;j++){
			window.console.log(mcList[j].cz);
		}
		 */
		
		return;
	}
	
	var c=0;
	sineCosine(a,b,c);
	//根据a，b重新更新 mcList
	for(var j=0;j<mcList.length;j++)
	{
		var rx1=mcList[j].cx;
		var ry1=mcList[j].cy*ca+mcList[j].cz*(-sa);
		var rz1=mcList[j].cy*sa+mcList[j].cz*ca;
		
		var rx2=rx1*cb+rz1*sb;
		var ry2=ry1;
		var rz2=rx1*(-sb)+rz1*cb;
		
		var rx3=rx2*cc+ry2*(-sc);
		var ry3=rx2*sc+ry2*cc;
		var rz3=rz2;
		
		mcList[j].cx=rx3;
		mcList[j].cy=ry3;
		mcList[j].cz=rz3;
		//per是调节scale的参数
		per=d/(d+rz3);
		
		mcList[j].x=(howElliptical*rx3*per)-(howElliptical*2);
		mcList[j].y=ry3*per;
		mcList[j].scale=per;
		mcList[j].alpha=per;
		
		mcList[j].alpha=(mcList[j].alpha-0.3)*(6/10);
	}
	
	doPosition();
	depthSort();
}

function depthSort()
{
	var i=0;
	var aTmp=[];
	
	for(i=0;i<aA.length;i++)
	{
		aTmp.push(aA[i]);
	}
	
	aTmp.sort
	(
		function (vItem1, vItem2)
		{
			if(vItem1.style.fontSize>vItem2.style.fontSize)
			{
				return -1;
			}
			else if(vItem1.style.fontSize<vItem2.style.fontSize)
			{
				return 1;
			}
			else
			{
				return 0;
			}
		}
	);
	
	//sort 之后吧 index 更改
	window.console.log("fontsize sort start------------");
	for(i=0;i<aTmp.length;i++)
	{
		window.console.log(aTmp[i].innerText+"--"+i +"--"+aTmp[i].style.fontSize);
		aTmp[i].style.zIndex=i+1;
	}
	window.console.log("fontsize sort end------------");
}

function positionAll()
{
	var phi=0;
	var theta=0;
	var max=mcList.length;
	var i=0;
	
	var aTmp=[];
	var oFragment=document.createDocumentFragment();
	
	//将 <a>随机排序并存入 aTmp
//	window.console.log("aTmp开始------------");
	for(i=0;i<aA.length;i++)
	{
		aTmp.push(aA[i]);
//		window.console.log(aTmp[i].innerText);
	}
//	window.console.log("aTmp结束------------");
	aTmp.sort
	(
		function ()
		{
			return Math.random()<0.5?1:-1;
		}
	);
//	window.console.log("aTmp开始------------");
	for(i=0;i<aTmp.length;i++)
	{
		window.console.log(aTmp[i].innerText);
	}
//	window.console.log("aTmp结束------------");
	//将随机排序后的aTmp存放到Fragment中
	for(i=0;i<aTmp.length;i++)
	{
		oFragment.appendChild(aTmp[i]);
	}
	
	oDiv.appendChild(oFragment);
	
	//循环计算每一个 Tag的位置
	//tag分为球前面的和球后面的
	for( var i=1; i<max+1; i++){
		//枚举    相对于球心 的 phi 0到 π    theta 0-2π
		if( distr )
		{
			phi = Math.acos(-1+(2*i-1)/max);
			theta = Math.sqrt(max*Math.PI)*phi;
		}
		else
		{
			phi = Math.random()*(Math.PI);
			theta = Math.random()*(2*Math.PI);
		}
		//坐标变换  cx cy cz计算相对于球心的位置 范围在  （-radius ， radius）之间
		mcList[i-1].cx = radius * Math.cos(theta)*Math.sin(phi);
		mcList[i-1].cy = radius * Math.sin(theta)*Math.sin(phi);
		mcList[i-1].cz = radius * Math.cos(phi);
		//这计算的可能是绝对位置了吧
		//首次排列<a>的位置
		
		// 注意： cx cy控制tag的位置    cz控制tag的 大小？
		aA[i-1].style.left=mcList[i-1].cx+oDiv.offsetWidth/2-mcList[i-1].offsetWidth/2+'px';
		aA[i-1].style.top=mcList[i-1].cy+oDiv.offsetHeight/2-mcList[i-1].offsetHeight/2+'px';
		aA[i-1].style.color = getRandomColor();
		
	}
	
	
}
var maxScaleIndex = 0;
var maxScaleIndexColor;
function doPosition()
{
	var l=oDiv.offsetWidth/2;
	var t=oDiv.offsetHeight/2;
	var maxScale = 0;
	aA[maxScaleIndex].style.color = maxScaleIndexColor;
	for(var i=0;i<mcList.length;i++)
	{
		aA[i].style.left=mcList[i].cx+l-mcList[i].offsetWidth/2+'px';
		aA[i].style.top=mcList[i].cy+t-mcList[i].offsetHeight/2+'px';
		
//		aA[i].style.fontSize=Math.ceil(12*mcList[i].scale/2)+8+'px';
		//给字体大小一个二次曲线增长 x^2
		aA[i].style.fontSize=Math.ceil(60*Math.pow(((mcList[i].scale-0.75)/0.75),2))+5+'px';
//		aA[i].style.filter="alpha(opacity="+100*mcList[i].alpha+")";
		aA[i].style.opacity=mcList[i].alpha;
//		aA[i].style.color = getRandomColor();
		if (mcList[i].scale > maxScale){
			maxScale = mcList[i].scale;
			maxScaleIndex =i;
		}
		
	}
	//这里需要把中奖者的名字放得更大一点
	aA[maxScaleIndex].style.fontSize=140+'px';
	aA[maxScaleIndex].style.opacity = 1;
	maxScaleIndexColor = aA[maxScaleIndex].style.color;
	aA[maxScaleIndex].style.color = "#ffffff" 
	
	
}
//分别将 a,b,c从 （0-180）的 转换为 π 
function sineCosine( a, b, c)
{
	sa = Math.sin(a * dtr);
	ca = Math.cos(a * dtr);
	sb = Math.sin(b * dtr);
	cb = Math.cos(b * dtr);
	sc = Math.sin(c * dtr);
	cc = Math.cos(c * dtr);
}