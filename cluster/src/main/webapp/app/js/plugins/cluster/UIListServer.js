define([
  'jquery', 
  'underscore', 
  'backbone',
  'service/ClusterGateway',
  'ui/UITable',
  'plugins/cluster/UIServerInfo',
  'plugins/cluster/UIJVMInfo',
  'plugins/cluster/UIMetric',
], function($, _, Backbone, ClusterGateway, UITable, UIServerInfo, UIJVMInfo, UIMetric) {
  
  var UIListServer = UITable.extend({
    label: "List Server",
    config: {
      toolbar: {
        dflt: {
          actions: [
            {
              action: "onRefresh", icon: "refresh", label: "Refresh", 
              onClick: function(thisTable) { 
                console.log("on refresh");
              } 
            }
          ]
        }
      },
      
      bean: {
        label: 'Cluster Member',
        fields: [
          { 
            field: "serverName",   label: "Server Name", defaultValue: '', 
            toggled: true, filterable: true,
            onClick: function(thisTable, row) {
              var bean = thisTable.getItemOnCurrentPage(row) ;
              thisTable.UIParent.push(new UIServerInfo()) ;
            },
            custom: {
              getDisplay: function(bean) {
                return bean.fromMember == null ? null : bean.fromMember.memberName ;
              }
            }
          },
          { 
            field: "ipAddress",  label: "IP Address",toggled: true,
            custom: {
              getDisplay: function(bean) {
                return bean.fromMember == null ? null : bean.fromMember.ipAddress ;
              }
            }
          },
          { 
            field: "port",  label: "Port",toggled: true,
            custom: {
              getDisplay: function(bean) {
                return bean.fromMember == null ? null : bean.fromMember.port ;
              }
            }
          },
          { 
            field: "result",   label: "Status", defaultValue: '', 
            toggled: true, filterable: true
          }
        ],

        actions:[
          {
            icon: "gear", label: "JVM",
            onClick: function(thisTable, row) { 
              var bean = thisTable.getItemOnCurrentPage(row) ;
              var results = ClusterGateway.call('server', 'jvminfo', {'member-name': 'generic'}) ;
              var jvmInfo = results[0].result ;
              var uiJVMInfo = new UIJVMInfo({server: bean.fromMember.memberName, jvmInfo: jvmInfo}) ;
              var uiBreadcumbs = thisTable.getAncestorOfType('UIBreadcumbs') ;
              uiBreadcumbs.push(uiJVMInfo) ;
            }
          },
          {
            icon: "gear", label: "Metric",
            onClick: function(thisTable, row) { 
              var bean = thisTable.getItemOnCurrentPage(row) ;
              var memberName = bean.fromMember.memberName ;
              var uiMetric = new UIMetric({memberName: bean.fromMember.memberName}) ;
              var uiBreadcumbs = thisTable.getAncestorOfType('UIBreadcumbs') ;
              uiBreadcumbs.push(uiMetric) ;
            }
          }
        ]
      }
    },

    onInit: function(config) {
      var result = ClusterGateway.call('server', 'ping', {}) ;
      this.setBeans(result) ;
    }
  });
  
  return UIListServer ;
});
