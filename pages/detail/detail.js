Page({

  data: {
    title: "",
    author: "",
    content: "",
    img: "",
    copyright: "",
    date: ""
  },

  onLoad: function (options) {
    this.setData({
      title: options.title,
      author: options.author,
      date: options.date,
      img: options.img, 
      copyright: options.copyright,
      content: options.content
    })
  }
})