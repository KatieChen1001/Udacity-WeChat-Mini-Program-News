//index.js

// 将中文菜单栏内容转为api请求的关键词
const sectionNameEng = {
  "头条": "national",
  "财经": "business",
  "观点": "opinion",
  "科技": "technology",
  "国际": "world",
  "体育": "sports",
  "房产": "realestate",
  "时尚": "fashion",
  "杂志": "tmagazine"
};

Page({ 
  data: {
    categories: [
      "头条",
      "财经",
      "观点",
      "科技",
      "国际",
      "体育",
      "房产",
      "时尚",
      "杂志"
    ],
    section: "头条",
    scrollableNews: [],
    newslist: []
  },

  onLoad(){
    this.getNYapi();
  },

  onTapViewDetail(event){
    // 将详情页需要展示的新闻数据直接在跳转时传如新页面
    let dataPassed = event.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/detail/detail?title=' + dataPassed.title + "&author=" + dataPassed.author + "&img=" + dataPassed.img + "&copyright=" + dataPassed.copyright + "&content=" + dataPassed.content + "&date=" + dataPassed.date
    })
  },

  onTapNavigateAway(event) {
    this.setData({
      section: event.currentTarget.dataset.section
    });
    this.getNYapi();
    console.log(this.data.section);
  },

  onPullDownRefresh() {
    this.getNYapi(() => {
      wx.stopPullDownRefresh()
    });
    // added console log to show pull down refresh works, because NY API is updated by day
    console.log("refreshed");
  },

  getNYapi(callback){
    wx.showLoading({
      title: 'Loading',
    });
    wx.request({
      url: 'https://api.nytimes.com/svc/topstories/v2/' + sectionNameEng[this.data.section] + '.json?api-key=1530f46a85644e70a995e7403562704b',
      success: res => {
        let result = res.data.results;
        let newslistres = [];
        let scrollNews = [];

        // ======= 首页滚动新闻栏 ======= //
        for (let i = 0; i < result.length; i++) {
          // console.log(result[i].section);
          if (scrollNews.length <=5 ) {
            if (result[i].multimedia.length < 3) {
              scrollNews.push({
                url: "/images/generic.jpg",
                link: result[i].short_url
              })
            } else {
              scrollNews.push({
                url: result[i].multimedia[3].url,
                link: result[i].short_url
              })
            }
          }
        }
        // ======= 列表新闻 ======= //
        // 截取api返回的前条新闻 
        for (let i = 0; i < result.length; i++) {
          // ======= 处理返回的多作者新闻 ======= //
          // 处理返回的新闻作者，如果返回结果为多作者，找出“and”位置，并截取第一位作者信息
          let tempAuthor = result[i].byline.slice(4); //slicing off the "By "
          let abbreviatedAuthor;
          let index = tempAuthor.indexOf("and");
          if (index !== -1) {
            abbreviatedAuthor = tempAuthor.slice(0, index);
            // 有三作者的情况还需要再一次截取（以“，”的位置为基准截取）
            let indexComa = abbreviatedAuthor.indexOf(",");
            if (indexComa !== -1){
              abbreviatedAuthor = tempAuthor.slice(0, indexComa)
            }
          } else {
            abbreviatedAuthor = tempAuthor;
          };
          // ======= 处理返回新闻缩略图（调用备选图案） ======= //
          if (result[i].multimedia.length < 3) {
            newslistres.push({
              title: result[i].title,
              date: result[i].updated_date.slice(0, 10),
              author: abbreviatedAuthor,
              link: result[i].short_url,
              thumbnailPath: "/images/generic.jpg",
              content: result[i].abstract,
              contentImg: "/images/generic.jpg",
              contentImgCopyright: "none"
            })
          } else {
            newslistres.push({
              title: result[i].title,
              date: result[i].updated_date.slice(0, 10),
              author: abbreviatedAuthor,
              link: result[i].short_url,
              thumbnailPath: result[i].multimedia[3].url,
              content: result[i].abstract,
              contentImg: result[i].multimedia[4].url,
              contentImgCopyright: result[i].multimedia[4].copyright
            })
          }
        };
        this.setData({
          newslist: newslistres,
          scrollableNews: scrollNews
        })
      },

      complete: () => {
        wx.hideLoading();
        typeof callback === 'function' && callback();
        // added console log to show pull down refresh has been stopped, because NY API is updated by day
        console.log("Stopped pull down refresh")
      },

      fail: function({errorMes}){
        console.log("request fail ", errorMes);
      }
    })
  }

})
