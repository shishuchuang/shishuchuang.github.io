// 获取图书
// 封装获取的方法
const creator = 'ssc'/* 接口所需的参数 */
function getBooksList() {
    axios({
        url: 'http://hmajax.itheima.net/api/books',
        method: "GET",
        params: {
            creator
        }
    }).then((result) => {
        console.log(result)
        const bookList = result.data.data
        // console.log(bookList)
        // 渲染数据
        var htmlStr = bookList.map((item, index) => {/* index为索引 */
            return `<tr>
            <td>${index + 1}</td>
            <td>${item.bookname}</td>
            <td>${item.author}</td>
            <td>${item.publisher}</td>
            <td data-id="${item.id}">
              <span class="del">删除</span>
              <span class="edit">编辑</span>
            </td>
          </tr>`
        }).join('')
        // console.log(htmlStr)
        document.querySelector('.list').innerHTML = htmlStr
    })
}
// 加载代码第一次渲染默认页面
getBooksList()
/*  新增图书
1、新增弹窗显示和隐藏
2、收集表单数据发生给服务端
3、重新渲染页面
 */
//获取新增弹窗对象
const modalDom = document.querySelector('.add-modal')/* 获取弹框dom */
const addModal = new bootstrap.Modal(modalDom)/* 实例化对象 */
// 保存按钮->点击-> 把数据提交给服务器->js关闭弹窗
document.querySelector('.add-btn').addEventListener('click', () => {
    // 收集表单数据发送给服务器
    const addFrom = document.querySelector('.add-form')
    // 使用serialize函数是插件里内容，快速收集表单元素的值 参数1：要获取哪个表单的数据 表单元素设置name属性，值会作为对象的属性名 建议name属性的值，最好和接口文档参数名一致* 参数2：配置对象
    const bookObj = serialize(addFrom, { hash: true, empty: true })
    console.log(bookObj)
    axios({
        url: 'http://hmajax.itheima.net/api/books',
        method: 'POST',
        data: {
            ...bookObj,/* 因为表单对象里的name名称和接口所需的对象名一致，例如bookname，可以使用展开运算符 */
            creator/* 声明了全局外号，对象简写 */
        }
    }).then((result => {
        console.log(result)
        // 渲染页面
        getBooksList()
        // 重置表单
        addFrom.reset()
        //隐藏弹框
        addModal.hide()
    }))

})

/* 
删除图书
1、获取图书Id->事件委托给父级->点击事件->根据Id删除数据发送给服务器->重新渲染页面
 */
//给父级td绑定点击事件委托
document.querySelector('.list').addEventListener('click', (e) => {
    // 判断点击的是不是删除键
    if (e.target.classList.contains('del')) {/* contains是否包含，可用于查找dom和字符串 */
        // 获取ID？渲染时设置自定义属性绑定Id,通过点击目标源使用dataset获取自定义属性里的id
        const bookId = e.target.parentNode.dataset.id
        console.log(bookId)
        // 删除图书
        axios({
            url: `http://hmajax.itheima.net/api/books/${bookId}`,
            method: 'DELETE'
        }).then((result => {
            console.log(result)
            //删除图书成功就重新渲染页面
            getBooksList()
        }))
    }
})
/* 编辑
1、编辑按钮显示和隐藏，注意哪些用属性控制，哪些用js控制
2、表单数据回显->从服务器获取数据
3、修改后发送服务器渲染页面
 */
//获取编辑弹窗对象
const editDom = document.querySelector('.edit-modal')/* 获取弹框dom */
const editmodal = new bootstrap.Modal(editDom)/* 实例化对象 */

// 因为span编辑按钮是动态创建的，所以给父元素点击事件
document.querySelector('.list').addEventListener('click', e => {
    // 判断是编辑按钮
    if (e.target.classList.contains('edit')) {
        const editboodId = e.target.parentNode.dataset.id
        // 从服务器获取数据
        axios({/* 根据Id把编辑的那一行图书数据获取到 */
            url: `http://hmajax.itheima.net/api/books/${editboodId}`/* 默认GET不用写 */
        }).then((result => {
            const editbookobj = result.data.data
            // 把数据回显到表单上
            /* 用后代选择器选择具体的边框 */
            // document.querySelector('.edit-form .bookname').value = 
            // editbookobj.bookname
            // 当数据对象属性和标签类名一致可以使用forEach遍历，遍历数据对象，使用属性去获取对应的标签，快速赋值
            // const keys = Object.keys(editbookobj)/* 返回一个由对象键组成的数组 ['id', 'bookname', 'author', 'publisher']*/
            // keys.forEach( key=>{
            //     document.querySelector(`.edit-form .${key}`).value = editbookobj[key]
            // })
            // 遍历数据对象，使用属性去获取对应的标签，快速赋值
            // for(const key in editbookobj){/* key代表正在遍历的数据对象中每个属性的名称 */
            //     // if(editbookobj.hasOwnProperty(key)){/* hasOwnProperty判断一个对象自身是否有指定的属性，有就true否则false */
            //     if( document.querySelector(`.edit-form .${key}`).name === key){
            //         // console.log(document.querySelector(`.edit-form .${key}`))/* 通过循环可以遍历出表单所有的标签 */
            //         document.querySelector(`.edit-form .${key}`).value = editbookobj[key]
            //     }

            // }
            /* 当数据对象属性名和表单name一致可以使用for遍历  obj[key]=input.name */
            var forElements = document.getElementsByClassName('edit-form')[0].elements/* 获取表单所有元素 */
            for (const key in editbookobj) {/* key代表的是对象里的每个属性名 */
                for (const element of forElements) {/* elements 代表取的是forElemetns里的每个元素 */
                    if (element.name === key) {/* 当元素name=对象属性名 */
                        element.value = editbookobj[key]/* 把对象值赋值给表单 */
                    }
                }
            }
            // console.log(forElements)
        }))
        // 点击编辑显示弹窗
        editmodal.show()
    }
})
//点击修改->把表单数据传给服务器->重新渲染
document.querySelector('.edit-btn').addEventListener('click', e => {
    if (e.target.classList.contains('edit-btn')) {
        const editform = document.querySelector('.edit-form')
        // 使用serialize函数是插件里内容，快速收集表单元素的值 参数1：要获取哪个表单的数据 表单元素设置name属性，值会作为对象的属性名 建议name属性的值，最好和接口文档参数名一致* 参数2：配置对象
        // console.log(bookObj)  {id: '430478', bookname: 'Web前端', author: 'ssc12', publisher: '深圳'}
        const {id,bookname,author,publisher} = serialize(editform, { hash: true, empty: true })/* 解构析值 */
        axios({
            url:`http://hmajax.itheima.net/api/books/${id}`,
            method:'PUT',
            data:{
                // ...bookObj 也可以展开运算符，多样化使用解构也可以
                // id:id,
                id,/*对象属性名和值一样简写 */
                bookname,
                author,
                publisher
            }
        }).then((result=>{
            // console.log(result)
            getBooksList()
        }))
        editmodal.hide()
    }
})


