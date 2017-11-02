/**
 * 扩展内容，提供jquery插件类似的扩展功能
 * amd模块，使用requirejs载入
 */

define([
  'config',
  'util'
], function (config, util) {
  return {
    /**
     * confirm方法，使用 $$.confirm 将一段html结构变成confirm功能弹窗
     * @param options json object对象
     *     -- options.container：弹窗div，jquery对象
     *     -- options.trigger：点击trigger呼出弹窗，domNode对象
     *     -- options.position：弹窗出现位置，string，目前支持'bottomLeft','bottomRight'
     *     -- options.accept：点击确定后触发的回调函数
     *     -- options.cancel：点击取消后触发的回调函数
     */
    confirm: function (options) {
	  
      var confirm = options.container
      var trigger = options.trigger
      var position = options.position || 'bottomLeft'
      var acceptCallback = options.accept
      var cancelCallback = options.cancel
	  var buttomToTop = trigger.getBoundingClientRect().bottom
	  //判断trigger是否是下拉菜单中的，如果是，则将trigger设置为当前菜单ul对象
	  if($(trigger).parents('ul.dropdown-menu').length>0){
	  	var triggerHeight = trigger.clientHeight
		 trigger = $(trigger).parents('ul.dropdown-menu')[0]
		 if($(trigger).parent().hasClass('dropup')){
		 	buttomToTop = trigger.getBoundingClientRect().bottom+triggerHeight
		 }else{
		 	buttomToTop = trigger.getBoundingClientRect().top
		 }
		 
	  }
	  
      switch (position) {
        case 'bottomLeft':
          confirm.css({
            top: document.body.scrollTop + buttomToTop + 10,
            right: document.documentElement.clientWidth - trigger.getBoundingClientRect().right,
            left: 'auto'
          })
          break
        case 'bottomRight':
          confirm.css({
            top: document.body.scrollTop + trigger.getBoundingClientRect().bottom + 10,
            left: trigger.getBoundingClientRect().left,
            right: 'auto'
          })
          break
      }

      confirm
      .removeClass('bottomLeft')
      .removeClass('bottomRight')
      .addClass(position)
      .show()

      $(document)
      .off('click.confirm')
      .on('click.confirm', function (e) {
        if (!trigger.contains(e.target) && !confirm[0].contains(e.target)) {
          confirm.hide()
        }
      })

      confirm.find('.accept')
      .off('click')
      .on('click', function () {
        if (acceptCallback) acceptCallback()
        confirm.hide()
      })

      confirm.find('.cancel')
      .off('click')
      .on('click', function () {
        if (cancelCallback) cancelCallback()
        confirm.hide()
      })
    },
    /**
     * switcher方法，使用 $$.switcher 将一段 <div class="row"></div> 结构变成一段含有左右两侧列表，
     *              列表项可以左右交换的组件
     * @param options json object对象
     *     -- options.container：组件容器 jquery对象
     *     -- options.fromTitle：左侧列表title string
     *     -- options.toTitle：右侧列表title string
     *     -- options.fromArray：左侧列表数据源 数组
     *     -- options.toArray：右侧列表title 数组
     *     -- options.field：用于显示的字段名称 string
     *     -- options.formatter：formatter Function
     *     -- options.sort：是否开启手动排序 Boolean
     *
     * FIXME 逻辑写得不清晰，仅可用，需要完善
     */
    switcher: function (options) {
      var container = options.container
      var fromTitle = options.fromTitle || '左侧列表'
      var toTitle = options.toTitle || '右侧列表'
      var fromArray = options.fromArray || []
      var toArray = options.toArray || []
      var field = options.field || 'text'
      var formatter = options.formatter || null
      var sort = !!options.sort

      var fromList = $('<div class="col-sm-6"><div class="box" style="border: 1px solid #d2d6de;"></div></div>')
      var toList = $('<div class="col-sm-6"><div class="box" style="border: 1px solid #d2d6de;"></div></div>')
      var fromHeader = generateHeader(fromTitle)
      var toHeader = generateHeader(toTitle)
      var fromBody = generateBody(fromList, toList, fromArray, toArray)
      var toBody = generateBody(toList, fromList, toArray, fromArray, 1)

      fromList.find('.box').append(fromHeader).append(fromBody)
      toList.find('.box').append(toHeader).append(toBody)
      container.empty().append(fromList).append(toList)

      function generateHeader (title) {
        return $('<div class="box-header" style="border-bottom: 1px solid #d2d6de;"><h6 style="margin: 0;">' + title + '</h6></div>')
      }

      function generateBody (fromList, toList, fromArr, toArr, sign) {
        var body = $('<div class="box-body" style="height: 300px; overflow-y: auto;"></div>')
        var ul = $('<ul class="todo-list"></ul>')
        fromArr.forEach(function (item, index) {
          ul.append(generateCell(fromList, toList, fromArr, toArr, field, formatter, item, index, sign))
        })
        body.append(ul)
        return body
      }

      function generateCell (fromList, toList, fromArr, toArr, field, formatter, source, index, sign) {
        var li = $('<li></li>')
        var indexer = $('<span class="handle">' + (index + 1) + '</span>')
        var innerHTML = !!formatter ? formatter(source[field]) : source[field]
        var switchBtn = $('<i class="fa pull-right switcher-arrow ' + (sign ? 'fa-arrow-circle-o-left text-red' : 'fa-arrow-circle-o-right text-green') + '"></i>')
        var upBtn = $('<i class="fa pull-right switcher-arrow fa-arrow-circle-o-up text-yellow"></i>')
        var downBtn = $('<i class="fa pull-right switcher-arrow fa-arrow-circle-o-down text-yellow"></i>')
        li.html(innerHTML).prepend(indexer).append(switchBtn)

        switchBtn.on('click', function () {
          var currentIndex = fromArr.indexOf(source)
          fromArr.splice(currentIndex, 1)
          toArr.push(source)

          fromList.find('li:eq(' + currentIndex + ')').remove()
          fromList.find('.handle').each(function (index, item) {
            $(item).html(index + 1)
          })
          toList.find('ul').append(generateCell(toList, fromList, toArr, fromArr, field, formatter, source, index, !sign))
        })

        if (sort) {
          li.append(downBtn).append(upBtn)
          upBtn.on('click', function () {
            var currentIndex = fromArr.indexOf(source)
            if (currentIndex) {
              fromArr.splice(currentIndex, 1)
              fromArr.splice(currentIndex - 1, 0, source)

              fromList.find('li:eq(' + currentIndex + ')').remove()
              fromList.find('li:eq(' + (currentIndex - 1) + ')').before(generateCell(fromList, toList, fromArr, toArr, field, formatter, source, index, sign))
              fromList.find('.handle').each(function (index, item) {
                $(item).html(index + 1)
              })
            }
          })
          downBtn.on('click', function () {
            var currentIndex = fromArr.indexOf(source)
            if (currentIndex !== fromArr.length - 1) {
              fromArr.splice(currentIndex, 1)
              fromArr.splice(currentIndex + 1, 0, source)

              fromList.find('li:eq(' + currentIndex + ')').remove()
              fromList.find('li:eq(' + currentIndex + ')').after(generateCell(fromList, toList, fromArr, toArr, field, formatter, source, index, sign))
              fromList.find('.handle').each(function (index, item) {
                $(item).html(index + 1)
              })
            }
          })
        }

        return li
      }

    },
    /**
     * uploader方法，使用 $$.uploader 将一段 <div class="form-group"></div> 结构变成一个上传附件按钮，
     *              每次选择附件后立即上传附件到 /yup接口，并返回附件信息
     * @param options json object对象
     *     -- options.container：组件容器 jquery对象
     *     -- options.size：上传附件按钮尺寸，string，支持 默认为空 和 'sm' 两种尺寸
     *     -- options.btnName：按钮文字 string
     *     -- options.success：附件上传成功后执行的回调函数
     *
     */
    uploader: function (options) {
      var container = options.container
      var size = options.size || ''
      var success = options.success || null
      var btnName = options.btnName || '上传附件'

      var form = $('<form method="post" class="yupForm" enctype="multipart/form-data"></form>')
      var btn = $('<button class="btn btn-default ' + (size ? 'btn-' + size : '') + '">'+btnName+'</button>')
      var input = $('<input name="yupUpload" class="' + size + '" style="width: ' + (size ? btnName.length * 12 + 22 : btnName.length * 14 + 26) + 'px" type="file"/>')

      form.append(btn).append(input).appendTo(container)

      form.delegate('input:file', 'change', function () {
        var fileSize = this.files[0].size
        form.ajaxSubmit({
          url: config.api.yup,
          success: function (data) {
            if (!!success) {
              var remoteFile = data[0]
              success({
                name: remoteFile.realname,
                url: '/' + remoteFile.url,
                size: fileSize
              })
              form.find('input:file').remove()
              form.append('<input name="yupUpload" class="' + size + '" type="file"/>')
            }
          }
        })
      })
    },
    /**
     * 搜索表单初始化，使用 $$.searchInit 将grid中的搜索表单键盘事件绑定表格刷新
     * @param form：搜索表单 jquery对象
     * @param table：搜索表单对应的表格 jquery对象
     */
    searchInit: function (form, table) {
      var commonInputs = form.find('input:text:not(.datepicker)')
      var datepickers = form.find('input:text.datepicker')
      var selects = form.find('select')
      var radios = form.find('input:radio')

      commonInputs.each(function (index, item) {
        $(item)
        .on('focus', function () {
          $(document).on('keyup.gridSearch', function (e) {
            if (e.keyCode === 13) {
              table.bootstrapTable('refresh')
            }
          })
        })
        .on('blur', function () {
          $(document).off('keyup.gridSearch')
        })
      })

      datepickers.each(function (index, item) {
        $(item)
          .datetimepicker({
            showClear: true
          })
          .on('dp.hide', function () {
            table.bootstrapTable('refresh')
          })
      })

      selects.each(function (index, item) {
        $(item).on('change.gridSearch', function () {
          table.bootstrapTable('refresh')
        })
      })

      radios.each(function (index, item) {
        // icheck checked事件
        $(item).on('ifChecked', function (e) {
          table.bootstrapTable('refresh')
        })
      })
    },
    /**
     * treetable初始化
     * @param source：数据源 数组
     * @param table：表格 jquery对象
     * @param columns：单元格配置，同bootstrap配置中的culumns 数组
     */
    treetableInit: function (source, table, columns) {
      var that = this
      var tbody = $('<tbody></tbody>')
      source.forEach(function (item) {
        tbody.append(that.treetableRowGenerator(item, columns))
        if (item.children) {
          item.children.forEach(function (sub) {
            tbody.append(that.treetableRowGenerator(sub, columns, item.id))
            if (sub.children) {
              sub.children.forEach(function (triple) {
                tbody.append(that.treetableRowGenerator(triple, columns, sub.id))
              })
            }
          })
        }
      })

      table
      .append(tbody)
      .treetable({
        expandable: true
      })
      .treetable('expandAll')
    },
    /**
     * treetable row生成
     * @param item：row数据源 object
     * @param columns：单元格配置，同bootstrap配置中的culumns 数组
     * @param parentId：父级row菜单id，没有父级可为空
     */
    treetableRowGenerator: function (item, columns, parentId, opType) {
      var tr = $('<tr data-tt-id="' + item.id + '"></tr>')
      if (parentId) {
        tr.attr('data-tt-parent-id', parentId)
      }
      var className = ''
      switch (opType) {
        case 'add':
          className = 'text-red'
          break
        case 'update':
          className = 'text-blue'
          break
        default:
          break
      }
      columns.forEach(function (column) {
        var td = $('<td></td>')
        td.css({
          'width': column.width ? parseInt(column.width) + 'px' : 'auto',
          'text-align': column.align || 'left'
        }).addClass(className)
        var value = item[column.field] || ''
        var formatter = column.formatter ? column.formatter(value, item) : value
        td.html(formatter).appendTo(tr)
        var events = column.events
        if (events) {
          for (var key in events) {
            var btnClass = key.split(' ')[1]
            var btnFunc = key.split(' ')[0]
            td.find(btnClass).on(btnFunc, (function (events, key, value, item) {
              return function (e) {
                events[key].call(this, e ,value, item)
              }
            })(events, key, value, item))
          }
        }
      })
      return tr
    },
    /**
     * iCheck datetimepicker 区域内初始化
     * @param parent：要进行初始化的区域 jquery对象
     */
    inputPluginsInit: function (parent) {
      parent.find('.icheck').iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        radioClass: 'iradio_minimal-blue'
      })
      parent.find('.datepicker').each(function (index, item) {
        $(item)
	        .datetimepicker({
	            showClear: true
	        })
      		.on('dp.change',function(e){
      			var form = $(item).closest('form')
	          	if($(item).hasClass('changing')){
	          		form.find('.changing').removeClass('changing')
	          		return ;
	          	}
	          	$(item).addClass('changing')
	          	 var temp = $(item).attr('data-date-end')||''
	          	 var dom = null;
	          	 var val = ''
	          	 if(temp){
	          	 	dom = form.find('[name='+temp+']')
	          	 	dom.addClass('changing')
	          	 	val = dom.val()
	          	 	dom.data("DateTimePicker").minDate(e.date);
	          	 	if(!val)dom.val('')
	          	 	
	          	 }
	          	 temp = $(item).attr('data-date-begin')
	          	 if(temp){
	          	 	dom = form.find('[name='+temp+']')
	          	 	dom.addClass('changing')
	          	 	val = dom.val()
	          	 	dom.data("DateTimePicker").maxDate(e.date);
	          	 	if(!val)dom.val('')
	          	 }
	          	 $(item).removeClass('changing')
          	})
      	})
    },
    /**
     * 枚举值填充表单元素 区域内初始化
     * @param parent：要进行初始化的区域 jquery对象
     */
    enumSourceInit: function (parent) {
      parent.find('[data-enum-fetch]').each(function (index, item) {
        var enu = $(item).attr('data-enum-fetch')
        switch (item.nodeName){
          case 'SELECT':
            $(item).empty()
            var options = ''
            var defaultText = $(item).attr('data-enum-text')
            if (defaultText) {
              options += '<option value="">' + defaultText + '</option>'
            }
            $(config[enu]).each(function (index, item) {
              options += '<option value="' + item.id + '">' + item.text + '</option>'
            })
            $(item).append(options)
            if ($(item).attr('change-immediately')) {
              // 如果事先声明了change-immediately，触发一下change事件
              $(item).change()
            }
        }
      })
      config.enumSourceState = 'loaded'
    },
    /**
     * required 元素加*号
     * @param parent：要进行初始化的区域 jquery对象
     */
    requiredInit: function (parent) {
    	parent.find('input, select, textarea').each(function(){
    		var el = $(this);
    		var controlGroup = el.parents('.form-group');  
            controlGroup.removeClass('has-error has-success');  
            controlGroup.find("#valierr").remove();
            if(el.attr('required')) {
            	var att = el.attr('name');
//          	console.log(att)
            	var ve = '<span id="valierr" style="color:#dd4b39;font-size:16px;position:absolute;">＊</span>';//
//          	var lebel = el.siblings("label"); // 获取当前节点的同胞元素
//          	if(!lebel)
//          		lebel = el.parent().siblings("label");// 获取父节点的同胞元素
//          	lebel.append(ve); 
            	controlGroup.children("label").append(ve);
            }
    	})
    	
    },
    /**
     * 表单自动填充
     * @param form 操作表单 jquery对象
     * @param source 数据源对象 json object
     */
    formAutoFix: function (form, source) {
      var domForm = form[0]
      for (var key in source) {
        var domElm = domForm[key]
        switch (Object.prototype.toString.call(domElm)) {
          case '[object HTMLInputElement]':
          case '[object HTMLTextAreaElement]':
          case '[object HTMLSelectElement]':
            domElm.value = source[key]
            
            var key_s = key + '_s'
            var vele = document.getElementById(key_s)
            if (vele) {
            	if (key_s === 'netRevenue_s') {
            		vele.innerHTML = $.number(source[key], 2)
            	} else {
            		vele.innerHTML = $.number(source[key], 6)
            	}
            	
            }
            
            break
          case '[object RadioNodeList]':
            $(domElm).each(function (index, item) {
              if (item.value === (source[key] + '')) {
                $(item).iCheck('check')
              }
            })
            break
          default:
            break
        }
      }
    },
    /**
     * 详情内容自动填充
     * @param parent 操作区域 jquery对象
     * @param source 数据源对象 json object
     */
    detailAutoFix: function (parent, source) {
      var details = parent.find('[data-detail-fetch]')
      details.each(function (index, item) {
        var prop = $(item).attr('data-detail-fetch')
        var propValue = source[prop]
        var isEnum = $(item).attr('data-enum-transform')
        if (isEnum) {
          propValue = util.enum.transform(isEnum, propValue)
        }
               var arr={"currency":2,"currency0":0,"currency1":1,"currency6":6,"quantity":0,"decimal0":0,"decimal1":1,"decimal2":2,"decimal3":3,"decimal4":4,"decimal5":5,"decimal6":6}
        	$.each(arr, function(k,v) {
						if ($(item).hasClass(k)) {
							if (propValue && isNaN(propValue)) {
								return;
							}
							propValue=$.number(propValue,v);
						}
			});
        switch (Object.prototype.toString.call(item)) {
          case '[object HTMLDivElement]':
          case '[object HTMLTableCellElement]':
        	$(item).html((propValue === undefined || propValue === null ||  propValue === '') ? '--' : propValue)
        	break
          case '[object HTMLInputElement]':
          case '[object HTMLTextAreaElement]':
          case '[object HTMLSelectElement]':
        	$(item).val((propValue === undefined || propValue === null || propValue === '') ? '--' : propValue)
          	break
          default:
        	break
        }
      })
      util.formatNum();
    }
  }
})