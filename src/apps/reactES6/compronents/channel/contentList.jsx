import React,{Component} from 'react';
import {Link} from 'react-router';
import $ from "webpack-zepto";
import Hammer from 'react-hammerjs';
import '../../../../public/plugin/swiper/swiper.min.css'
import Swiper from '../../../../public/plugin/swiper/swiper.min.js';
window.swiper={};

//栏目组件
class ContentList extends Component {
    render() {
        let props = this.props;
        var channels = [];
        //将对象转成数组，使于遍历
        for (var item in props.channelsData) {
            channels.push(props.channelsData[item]);
        }
        //遍历组件，实现嵌套循环
        let channelsList = channels.map((item, i) => (
            <ItemList
                key={'itemList' + item.id}
                index={i}
                id={item.id}
                item={item}
                channelId={props.channelId}
                requestData={props.requestData}
                swiperY={props.swiperY}
                setY={props.setY}
            />
        ));
        return (
            <div>
                {channelsList}
            </div>
        )
    }
}
//列表组件
class ItemList extends Component {
    constructor(props){
        super(props);
        //滑动功能
        this.onSwiper = (id) => {
            window.swiper["id_"+id] = new Swiper(".swiper-contentlist"+id, {
                scrollbar: '.swiper-scrollbar',
                direction: 'vertical',
                slidesPerView: 'auto',
                mousewheelControl: true,
                freeMode: true,
                observer:true,//修改swiper自己或子元素时，自动初始化swiper
                observeParents:true,//修改swiper的父元素时，自动初始化swiper
                onInit:(swiper)=>{
                    //加载后清除引用的class，防止被同名重新初始化
                    //$(".swiper-contentlist"+id).removeClass("swiper-contentlist"+id);
                    if (props.swiperY["id_"+props.id]){
                        swiper.setWrapperTranslate(props.swiperY["id_"+props.id]);
                    }
                },
                onSetTransition: (swiper, transiton) => {
                    //记录每个滑块的Y值
                    props.setY(id, swiper.getWrapperTranslate("y"));
                    if (swiper.translate < 0  && -(swiper.virtualSize - swiper.height) >= swiper.translate){
                        let props = this.props,
                            id= props.item.id,
                            url = props.item.nextPage;
                        if (url) {
                            this.props.requestData(url, id);
                            props.item.nextPage="";
                        }
                    }
                },
                onTransitionEnd(swiper){
                    //记录每个滑块的Y值
                    props.setY(id, swiper.getWrapperTranslate("y"));
                },
                onTouchStart: (swiper, even) => {
                    $(".contentlist-slide").each(function(){
                        //安卓下列表滚动异常的问题
                        if ($(this).height() < $(this).children().height()+10){
                            $(this).height($(this).children().height()+80);
                        }
                    });
                    swiper.onResize();
                    //记录每个滑块的Y值
                    props.setY(id, swiper.getWrapperTranslate("y"));
                },
            onTouchEnd: (swiper) => {
                    //往下滑到设定值，重新请求数据
                    if (swiper.getWrapperTranslate('y')>120){
                    //    this.props.requestData(["channels", this.props.item.id]);
                    }
                }
            });
        }
    }
    componentDidMount(){
        this.onSwiper(this.props.id);
    }

    //下一页
    onNextPage(ev, url, id) {
        let props = this.props;
        if (url) {
            props.requestData(url, id);
        }
    }

    render() {
        let props = this.props;
        let itemList = [];
        if (props.item.list) {
            //遍历组件，实现嵌套循环
            itemList = props.item.list.map((item, i) => (
                <ItemRow
                    key={'itemRow'+props.index+''+i}
                    index={props.index + '' + i}
                    item={item}
                />
            ))
        }
        var style={
            height:"100%",
            width:"100%",
            position:"absolute",
            top:0,
            left:0,
            zIndex:props.item.active ? "1" : "0",
            opacity:props.item.active ? "1" : "0",
        }
        return (
            <div style={style} key={'channelsList'+props.index}>
                <div className={"swiper-container swiper-contentlist" + props.id}>
                    <div className="swiper-wrapper">
                        <div className="swiper-slide contentlist-slide">
                            <div>
                                <div className="tab-area"></div>
                                <ol className="n card-list">
                                    {itemList}
                                </ol>
                                {props.item.nextPage ?
                                    <div style={{margin:30,textAlign:"center",fontSize:12}} onClick={(ev,url,id) => {this.onNextPage(ev, props.item.nextPage, props.id)}}>
                                        加载更多</div> :
                                    <div style={{margin:30,textAlign:"center",fontSize:12,color:"#999"}}>
                                        到底了</div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="swiper-scrollbar"></div>
                </div>
            </div>
        )
    }
}
//行组件
class ItemRow extends Component {
    render() {
        let props = this.props,
            item=props.item,
            imgs=[];
        if (item.imagesList){
            imgs = item.imagesList.filter((item,i) => {
                return item ? true : false;
            });
        }
        let imgs2 = imgs.length>1 ? true : false ;
        return (
            <li key={'contentList'+props.index}>
                <Link to={`/content/${item.pid}/${item.id}`} activeClassName="active">
                    <div className="title"><h3 dangerouslySetInnerHTML={{__html: item.title}}></h3></div>
                    {item.subTitle ? <div className={"subTitle "}><h6 className={!item.summary ? "summary" : ""}>{item.subTitle}</h6></div> : ''}
                    {item.summary ?
                        <div className="info">
                            {item.imageUrl && !imgs2 ?
                                <span><img src={item.imageUrl} alt=""/></span> : ''}
                            {item.summary ? <p>{item.summary}</p> : ''}
                        </div> : '' }
                    {imgs && (imgs2 || !item.summary)  ?
                    <div className={'imgs img'+ imgs.length}>
                        <ul className="n">
                            {imgs.map((img,i) => (
                                <li key={'itemrowImg' + i}><span dangerouslySetInnerHTML={{__html: img}}></span></li>
                            ))}
                        </ul>
                    </div> : ''}
                </Link>
            </li>
        )
    }
}

export default ContentList;