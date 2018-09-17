// pages/list/list.js
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
    section: ""
  },

  onLoad: function (options) {
    this.setData({
      section: options.section
    });
    this.getNYapi();
  },

  onPullDownRefresh() {
    this.getNYapi(() => {
      wx.stopPullDownRefresh()
    });
    // added console log to show pull down refresh works, because NY API is updated by day
    console.log("refreshed");
  },

  onTapViewDetail(event) {
    let dataPassed = event.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/detail/detail?title=' + dataPassed.title + "&author=" + dataPassed.author + "&img=" + dataPassed.img + "&copyright=" + dataPassed.copyright + "&content=" + dataPassed.content + "&date=" + dataPassed.date
    })
  },

  onTapNavigateAway(event) {
    let dataPassed = event.currentTarget.dataset;
    // console.log(dataPassed.section);
    wx.redirectTo({
      url: '/pages/list/list?section=' + sectionNameEng[dataPassed.section]
    })
  },

  // 由于新闻首页有轮播图组件而其他部分没有，所以为跳转回主页设立独立函数
  onTapBackToHome() {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },

  getNYapi(callback) {
    wx.request({
      url: 'https://api.nytimes.com/svc/topstories/v2/' + this.data.section + '.json?api-key=1530f46a85644e70a995e7403562704b',
      success: res => {
        let result = res.data.results;
        let newslistres = [];

        // ======= 列表新闻 ======= //
        // 截取api返回的前条新闻 
        for (let i = 0; i < result.length; i++) {
          // ======= 处理返回的多作者新闻 ======= //
          // 处理返回的新闻作者，如果返回结果为多作者，找出“and”位置，并截取第一位作者信息
          let tempAuthor = result[i].byline.slice(4);
          let abbreviatedAuthor;
          // console.log("tempAuthor = " + tempAuthor);
          let index = tempAuthor.indexOf("and");
          // console.log(index);
          if (index !== -1) {
            abbreviatedAuthor = tempAuthor.slice(0, index);
            // console.log("new tempAuthor = " + abbreviatedAuthor);
            let indexComa = abbreviatedAuthor.indexOf(",");
            if (indexComa !== -1) {
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
          newslist: newslistres
        })
      },

      complete: () => {
        callback && callback();
        // added console log to show pull down refresh has been stopped, because NY API is updated by day
        console.log("Stopped pull down refresh")
      }
    })
  }
})
