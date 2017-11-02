/**
 * 资产池管理
 */
define([
    'http',
    'config',
    'util',
    'extension'
], function(http, config, util, $$) {
    return {
        name: 'AssetPool',
        init: function() {
            getSPVList(http, config)
            var initParam = util.nav.getHashObj(location.hash).init
            if (initParam === 'yes') {
                $('#addAssetPoolModal').modal('show')
            }
            // 分页配置
            var pageOptions = {
                name: "",
                page: 1,
                rows: 10
            }
            var settingTableConfig = {
                columns:[
                    {
                        formatter: function (val, row) {
                            if (row.endAmount) {
                                return row.startAmount + '万 - ' + row.endAmount + '万'
                            } else {
                                return row.startAmount + '万以上'
                            }
                        }
                    },
                    {
                        field: 'feeRatio',
                        formatter: function (val) {
                            return val + '%'
                        }
                    },
                    {
                        width: 80,
                        align: 'center',
                        formatter: function (val) {
                            var buttons = [{
                                text: '删除',
                                type: 'button',
                                class: 'item-delete'
                            }]
                            return util.table.formatter.generateButton(buttons, 'settingTable')
                        },
                        events: {
                            'click .item-delete': function (e, val, row) {
                                var tableData = $('#settingTable').bootstrapTable('getData')
                                tableData.splice(tableData.indexOf(row), 1)
                                $('#settingTable').bootstrapTable('load', tableData)
                            }
                        }
                    }
                ]
            }
            var showSettingTableConfig = {
                columns:[
                    {
                        formatter: function (val, row) {
                            if (row.endAmount) {
                                return row.startAmount + '万 - ' + row.endAmount + '万'
                            } else {
                                return row.startAmount + '万以上'
                            }
                        }
                    },
                    {
                        field: 'feeRatio',
                        formatter: function (val) {
                            return val + '%'
                        }
                    }
                ]
            }
            $('#settingTable').bootstrapTable(settingTableConfig)
            $('#showSettingTable').bootstrapTable(showSettingTableConfig)
            util.form.validator.init($('#addFeeForm'))
            // 数据表格配置
            var tableConfig = {
                ajax: function(origin) {
                    http.post(config.api.duration.assetPool.getAll, {
                        data: pageOptions,
                        contentType: 'form'
                    }, function(rlt) {
                        origin.success(rlt)
                    })
                },
                pageNumber: pageOptions.page,
                pageSize: pageOptions.rows,
                pagination: true,
                sidePagination: 'server',
                pageList: [10, 20, 30, 50, 100],
                queryParams: getQueryParams,
                onLoadSuccess: function() {},
                columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (pageOptions.page - 1) * pageOptions.rows + index + 1
					}
				},{ 
                    // 名称
                    field: 'name'
                }, 
                { 
                    // 资产规模
                    field: 'scale',
                    formatter: function(val) {
                        return formatNumber(val)
                    }
                }, 
                /*{ 
                    // 现金比例
                    field: 'cashFactRate',
                    formatter: function(val) {
                        return util.safeCalc(val, '*', 100, 4)
                    }
                }, 
                { 
                    // 货币基金（现金管理类工具）比例
                    field: 'cashtoolFactRate',
                    formatter: function(val) {
                        return util.safeCalc(val, '*', 100, 4)
                    }
                }, 
                { 
                    // 信托（计划）比例
                    field: 'targetFactRate',
                    formatter: function(val) {
                        return util.safeCalc(val, '*', 100, 4)
                    }
                }, 
                { 
                    // 可用现金
                    field: 'cashPosition',
                    formatter: function(val) {
                        return util.safeCalc(val, '/', 10000, 4)
                    }
                }, 
                { 
                    // 冻结资金
                    field: 'freezeCash',
                    formatter: function(val) {
                        return util.safeCalc(val, '/', 10000, 4)
                    }
                }, 
                { 
                    // 在途资金
                    field: 'transitCash',
                    formatter: function(val) {
                        return util.safeCalc(val, '/', 10000, 4)
                    }
                }, */
                { 
                    // 托管费率
                    field: 'trusteeRate',
                    formatter: function(val) {
                        return formatPercent(val)
                    }
                }, 
                { 
                    // 管理费率
                    field: 'manageRate',
                    formatter: function(val) {
                        return formatPercent(val)
                    }
                }, 
                { 
                    // 当日收益计算状态
                    field: 'scheduleState'
                }, 
//              { 
//                  // 当日收益分配状态
//                  field: 'incomeState'
//              }, 
                { 
                    // 收益基准日
                    field: 'baseDate'
                }, 
                { 
                    // 状态
                    width: 70,
                    //align: 'center',
                    //halign: 'left',
                    field: 'state',
                    formatter: function(val) {
                        var className = ''
                        var str = util.enum.transform('ASSETPOOLSTATE', val)
                        switch (val) {
                            case 'ASSETPOOLSTATE_01':
                                className = 'text-yellow'
                                break
                            case 'ASSETPOOLSTATE_02':
                                className = 'text-green'
                                break
                            case 'ASSETPOOLSTATE_01':
                                className = 'text-red'
                                break
                        }
                        return '<span class="' + className + '">' + str + '</span>'
                    }
                }, 
                {
                    width: 280,
                    align: 'center',
                    formatter: function(val, row) {
                        var buttons = [{
                            text: '详情',
                            type: 'button',
                            class: 'item-detail',
                            isRender: row.state === 'ASSETPOOLSTATE_02'
                        }, {
                            text: '部分计算',
                            type: 'button',
                            class: 'item-calc',
                            isRender: row.state === 'ASSETPOOLSTATE_02' && row.scheduleState === '未计算'
                        }, {
                            text: '不计算',
                            type: 'button',
                            class: 'item-uncalc',
                            isRender: row.state === 'ASSETPOOLSTATE_02' && row.scheduleState === '未计算'
                        }, 
                        {
                            text: '审核',
                            type: 'button',
                            class: 'item-audit',
                            isRender: row.state === 'ASSETPOOLSTATE_01'
                        }, 
                        {
                            text: '编辑',
                            type: 'button',
                            class: 'item-update',
                            isRender: row.state !== 'ASSETPOOLSTATE_02'
                        },
                        /*
                        {
                            text: '详情',
                            type: 'button',
                            class: 'item-show',
                            isRender: row.state !== 'ASSETPOOLSTATE_02'
                        },
                        */
                        {
                            text: '删除',
                            type: 'button',
                            class: 'item-delete',
                            isRender: row.state === 'ASSETPOOLSTATE_03'
                        }/*,
                        {
                            text: '计提费率配置',
                            type: 'button',
                            class: 'item-setting',
                            isRender: row.state === 'ASSETPOOLSTATE_01'
                        }*/]
                        return util.table.formatter.generateButton(buttons, 'showSettingTable')
                    },
                    events: {
                        'click .item-detail': function(e, val, row) {
                            util.nav.dispatch('AssetPoolDuration', 'id=' + row.oid)
                        },
                        'click .item-calc': function(e, val, row) {
                            currentPool = row
                            $$.confirm({
                                container: $('#calcConfirmModal'),
                                trigger: this,
                                accept: function () {
                                    http.post(config.api.duration.assetPool.userPoolProfit, {
                                        data: {
                                            oid: row.oid,
                                            type: 'USER_CALC'
                                        },
                                        contentType: 'form'
                                    }, function(json) {
                                        $('#assetPoolTable').bootstrapTable('refresh');
                                    })
                                }
                            })
                        },
                        'click .item-uncalc': function(e, val, row) {
                            currentPool = row
                            $$.confirm({
                                container: $('#calcConfirmModal'),
                                trigger: this,
                                accept: function () {
                                    http.post(config.api.duration.assetPool.userPoolProfit, {
                                        data: {
                                            oid: row.oid,
                                            type: 'USER_NONE'
                                        },
                                        contentType: 'form'
                                    }, function(json) {
                                        $('#assetPoolTable').bootstrapTable('refresh');
                                    })
                                }
                            })
                        },
                        'click .item-audit': function(e, val, row) {
                            currentPool = row
                            http.post(config.api.duration.assetPool.getById, {
                                data: {
                                    oid: row.oid
                                },
                                contentType: 'form'
                            }, function(json) {
                                var result = json.result
                                var scopeStr = ''
                                json.result.scopes.forEach(function(item) {
                                    scopeStr += util.enum.transform('TARGETTYPE', item) + ' '
                                })
                                result.scopeStr = scopeStr
                                result = resultDataFormatPlus(result)
                                result.calcBasis = result.calcBasis + '\t/年'
                                $('#modal-footer').show()
                                $$.detailAutoFix($('#auditAssetPoolModal'), result)
                                $('#showTitle').html('审核资产池')
                                $('#auditAssetPoolModal').modal('show')
                            })
                            http.post(config.api.duration.assetPool.loadSetting, {
                                data: {
                                    assetPoolOid: row.oid
                                },
                                contentType: 'form'
                            }, function (rlt) {
                                $('#showSettingTable').bootstrapTable('load', rlt)
                            })
                        },
                        'click .item-update': function(e, val, row) {
                            currentPool = row
                            http.post(config.api.duration.assetPool.getById, {
                                data: {
                                    oid: row.oid
                                },
                                contentType: 'form'
                            }, function(json) {
                                var result = json.result
                                $('#updateSPV').value = result.spvOid
                                result = resultDataFormat(result)
                                $$.formAutoFix($('#updateAssetPoolForm'), result)
                                $(document.updateAssetPoolForm.scopes).val(json.result.scopes).trigger('change')
                                $('#updateAssetPoolModal').modal('show')
                            })
                        },
                        'click .item-show': function(e, val, row) {
                            currentPool = row
                            http.post(config.api.duration.assetPool.getById, {
                                data: {
                                    oid: row.oid
                                },
                                contentType: 'form'
                            }, function(json) {
                                var result = json.result
                                var scopeStr = ''
                                json.result.scopes.forEach(function(item) {
                                    scopeStr += util.enum.transform('TARGETTYPE', item) + ' '
                                })
                                result.scopeStr = scopeStr
                                result = resultDataFormatPlus(result)
                                result.calcBasis = result.calcBasis + '\t/年'
                                $('#modal-footer').hide()
                                $$.detailAutoFix($('#auditAssetPoolModal'), result)
                                $('#showTitle').html('详情')
                                $('#auditAssetPoolModal').modal('show')
                            })
                        },
                        'click .item-delete': function(e, val, row) {
                            currentPool = row
                            $$.confirm({
                                container: $('#confirmModal'),
                                trigger: this,
                                accept: function () {
                                    http.post(config.api.duration.assetPool.delete, {
                                        data: {
                                            pid: row.oid
                                        },
                                        contentType: 'form'
                                    }, function () {
                                        $('#assetPoolTable').bootstrapTable('refresh')
                                    })
                                }
                            })
                        },
                        'click .item-setting': function (e, val, row) {
                            currentPool = row
                            http.post(config.api.duration.assetPool.loadSetting, {
                                data: {
                                    assetPoolOid: row.oid
                                },
                                contentType: 'form'
                            }, function (rlt) {
                                $('#settingTable').bootstrapTable('load', rlt)
                            })
                            $('#settingModal').modal('show')
                        }
                    }
                }]
            }
            // 初始化数据表格
            $('#assetPoolTable').bootstrapTable(tableConfig);
            // 搜索表单初始化
            $$.searchInit($('#searchForm'), $('#assetPoolTable'));
            // 新增/修改资产池投资范围select2初始化
            $(document.addAssetPoolForm.scopes).select2()
            $(document.updateAssetPoolForm.scopes).select2()
            // 新增资产池按钮点击事件
            $('#assetPoolAdd').on('click', function() {
            	$(document.addAssetPoolForm.scopes).select2()
                $('#addAssetPoolModal').modal('show')
            })
            
            // 新增/修改资产池表单验证初始化
            $('#addAssetPoolForm').validator({
                custom: {
                    validfloat: util.form.validator.validfloat,
                    validint: util.form.validator.validint,
                    validpercentage: validpercentage
                },
                errors: {
                    validfloat: '数据格式不正确',
                    validint: '数据格式不正确',
                    validpercentage: '银行存款、现金管理类工具、信托计划三者比例总和不能超过100%'
                }
            })
            $('#updateAssetPoolForm').validator({
                custom: {
                    validfloat: util.form.validator.validfloat,
                    validint: util.form.validator.validint,
                    validpercentage: validpercentage
                },
                errors: {
                    validfloat: '数据格式不正确',
                    validint: '数据格式不正确',
                    validpercentage: '银行存款、现金管理类工具、信托计划三者比例总和不能超过100%'
                }
            })
            // 新增资产池 - 确定按钮点击事件
            $('#doAddAssetPool').on('click', function() {
                if (!$('#addAssetPoolForm').validator('doSubmitCheck')) return
                $('#addAssetPoolForm').ajaxSubmit({
                    url: config.api.duration.assetPool.create,
                    success: function() {
                        util.form.reset($('#addAssetPoolForm'))
                        $('#assetPoolTable').bootstrapTable('refresh');
                        $('#addAssetPoolModal').modal('hide')
                    }
                })
            })
            // 编辑资产池 - 确定按钮点击事件
            $('#doUpdateAssetPool').on('click', function() {
                if (!$('#updateAssetPoolForm').validator('doSubmitCheck')) return
                $('#updateAssetPoolForm').ajaxSubmit({
                    url: config.api.duration.assetPool.edit,
                    success: function() {
                        util.form.reset($('#updateAssetPoolForm'))
                        $('#assetPoolTable').bootstrapTable('refresh');
                        $('#updateAssetPoolModal').modal('hide')
                    }
                })
            })
            // 缓存当前操作数据
            var currentPool = null
            // 审核 - 不通过按钮点击事件
            $('#doUnAuditAssetPool').on('click', function() {
                http.post(config.api.duration.assetPool.audit, {
                    data: {
                        oid: currentPool.oid,
                        operation: 'no'
                    },
                    contentType: 'form'
                }, function() {
                    $('#assetPoolTable').bootstrapTable('refresh');
                    $('#auditAssetPoolModal').modal('hide')
                })
            })
            // 审核 - 通过按钮点击事件
            $('#doAuditAssetPool').on('click', function() {
                http.post(config.api.duration.assetPool.audit, {
                    data: {
                        oid: currentPool.oid,
                        operation: 'yes'
                    },
                    contentType: 'form'
                }, function() {
                    $('#assetPoolTable').bootstrapTable('refresh');
                    $('#auditAssetPoolModal').modal('hide')
                })
            })
            // 新增计提费率弹窗
            $('#feeAdd').on('click', function () {
                util.form.reset($(document.addFeeForm))
                $('#addFeeModal').modal('show')
            })
            // 新增计提费率
            $('#doAddFee').on('click', function () {
                var form = document.addFeeForm
                if (!$(form).validator('doSubmitCheck')) return
                var formdata = {
                    startAmount: parseFloat(form.startAmount.value),
                    endAmount: form.endAmount.value ? parseFloat(form.endAmount.value) : undefined,
                    feeRatio: parseFloat(form.feeRatio.value)
                }
                var tableData = $('#settingTable').bootstrapTable('getData')
                tableData.push(formdata)
                $('#settingTable').bootstrapTable('load', tableData)
                $('#addFeeModal').modal('hide')
            })
            // 保存资产池计提费率
            $('#doSaveSetting').on('click', function () {
                http.post(config.api.duration.assetPool.saveSetting, {
                    data: JSON.stringify({
                        assetPoolOid: currentPool.oid,
                        feeSettings: $('#settingTable').bootstrapTable('getData')
                    })
                }, function (rlt) {
                    $('#settingModal').modal('hide')
                })
            })
            function getQueryParams(val) {
                var form = document.searchForm
                $.extend(pageOptions, util.form.serializeJson(form)); //合并对象，修改第一个对象
                pageOptions.rows = val.limit
                pageOptions.page = parseInt(val.offset / val.limit) + 1
                return val
            }
            // 自定义验证 - 现金比例/现金管理类工具比例/信托计划比例 加起来不能超过100
            function validpercentage($el) {
                var form = $el.closest('form')
                var parts = form.find('input[data-validpercentage]')
                var percentage = 0
                parts.each(function(index, item) {
                    percentage += Number(item.value)
                })
                return !(percentage > 100)
            }
        }
    }
    
    /**
	 * 格式化数据
	 * 解析枚举值
	 * 单位换算成 万元
	 * 半分比换算成有 %
	 * @param {Object} result
	 */
    function resultDataFormat(result) {
        if (result.scale) {
            result.scale = formatUnitToWan(result.scale)
        }
        if (result.cashRate) {
            result.cashRate = formatPercent(result.cashRate)
        }
        if (result.cashtoolRate) {
            result.cashtoolRate = formatPercent(result.cashtoolRate)
        }
        if (result.targetRate) {
            result.targetRate = formatPercent(result.targetRate)
        }
        if (result.trusteeRate) {
            result.trusteeRate = formatPercent(result.trusteeRate)
        }
        if (result.manageRate) {
            result.manageRate = formatPercent(result.manageRate)
        }
        return result
    }
    
    /**
	 * 格式化数据（包含单位）
	 * 解析枚举值
	 * 单位换算成 万元
	 * 半分比换算成加 %
	 * @param {Object} result
	 */
    function resultDataFormatPlus(result) {
        if (result.scale) {
            result.scale = formatUnitToWan(result.scale) + '\t万元'
        }
        if (result.cashRate) {
            result.cashRate = formatPercent(result.cashRate) + '\t%'
        }
        if (result.cashtoolRate) {
            result.cashtoolRate = formatPercent(result.cashtoolRate) + '\t%'
        }
        if (result.targetRate) {
            result.targetRate = formatPercent(result.targetRate) + '\t%'
        }
        if (result.trusteeRate) {
            result.trusteeRate = formatPercent(result.trusteeRate) + '\t%'
        }
        if (result.manageRate) {
            result.manageRate = formatPercent(result.manageRate) + '\t%'
        }
        return result
    }
    
	/**
	 * 格式化单位为（万元）
	 * @param {Object} val
	 */
	function formatUnitToWan(val) {
		if (val) {
			val = parseFloat(val)
			return util.safeCalc(val, '/', 10000, 6)
		} else {
			return 0
		}
	}
		
	/**
	 * 格式化以千分位展示
	 * @param {Object} val
	 */
	function formatNumber(val) {
		if (val) {
			val = formatUnitToWan(val)
			return $.number(val, 6)
		} else {
			return 0
		}
	}
		
	/**
	 * 格式化单位为（万元）
	 * 以千分位展示
	 * @param {Object} val
	 */
	function formatPercent(val) {
		if (val) {
			val = parseFloat(val)
			return util.safeCalc(val, '*', 100, 4)
		} else {
			return '0'
		}
	}
})
// 新增资产池按钮点击事件
function getSPVList(http, config) {
    http.post(config.api.duration.assetPool.getAllSPV, {
        contentType: 'form'
    }, function (json) {
        var result = json.result
        var SPVSelectOptions = ''
        if (result) {
            result.forEach(function(item) {
                SPVSelectOptions += '<option value="' + item.spvId + '">' + item.spvName + '</option>'
            })
            $('#addSPV').html(SPVSelectOptions)
            $('#updateSPV').html(SPVSelectOptions)
        }
    })
}
