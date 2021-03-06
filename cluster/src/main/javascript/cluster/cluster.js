cluster = {} ;

cluster.Response = function(results) {
  this.results = results ;
  this.success = true ;

  this.isEmpty = function() { return this.results.length == 0 ; } ;

  this.getReturnResults = function() {
    var retResults = [] ;
    for(var i = 0 ; i < this.results.length; i++) {
      retResults[i] = this.results[i].result ;
    }
    return retResults ;
  };

  this.assertSuccess = function() {
    Assert.assertTrue(resp.success && !resp.isEmpty()) ;
  };

  for(var i = 0; i < results.length; i++) {
    var result = results[i];
    if(result.error != null) {
      this.success = false ;
      result.success = false ;
    } else {
      result.success = true ;
    }
  }
}

cluster.ResponsePrinter = function(printer, response) {
  this.printer = printer;
  this.response = response ;

  this.print = function() {
    this.printer.h2("Response summary");
    var fconfig = [
     { field: 'fromMember.ipAddress', header: 'IP Address'} ,
     { field: 'fromMember.port', header: 'Port'},
     { field: 'success', header: 'Success' },
     { field: 'result', header: 'Result', maxWidth: 80 }
    ];
    this.printer.printTable(this.response.results,  fconfig);
  };
}

cluster.ClusterRegistrationPrinter = function(printer, clusterRegistration) {
  this.printer = printer;
  this.clusterRegistration = clusterRegistration ;

  this.printServerRegistration = function() {
    this.printer.h2("Cluster Registration");
    var fconfig = [
      { field: 'clusterMember.uuid', header: 'UUID'} ,
      { field: 'clusterMember.ipAddress', header: 'IP Address'} ,
      { field: 'clusterMember.port', header: 'Port'},
      { field: 'roles', header: 'Roles'},
      { field: 'serverState', header: 'Server State'},
    ];
    this.printer.printTable(this.clusterRegistration.serverRegistration,  fconfig);
  };

  this.printServiceRegistration = function() {
    var fconfig = [
      { field: 'module', header: 'Module'} ,
      { field: 'serviceId', header: 'Service Id'} ,
      { field: 'state', header: 'State'} ,
    ];
    var servers = this.clusterRegistration.serverRegistration ;
    for(var i = 0 ; i < servers.length; i++) {
      var services = servers[i].services;
      var hostPort = servers[i].clusterMember.ipAddress + ":" + servers[i].clusterMember.port ;
      this.printer.h2("Server: " + hostPort);
      this.printer.printTable(services,  fconfig);
    }

  };
}

cluster.ModuleRegistrationPrinter = function(printer, member, moduleRegistrations) {
  this.printer = printer;
  this.member = member ;
  this.moduleRegistrations = moduleRegistrations ;

  this.printModuleRegistration = function() {
    var fconfig = [
      { field: 'moduleName', header: 'Module'} ,
      { field: 'autostart', header: 'Auto Start'} ,
      { field: 'autoInstall', header: 'Auto Install'} ,
      { field: 'installStatus', header: 'Install Status'} ,
      { field: 'runningStatus', header: 'Running Status'} 
    ];
    this.printer.h2("Member: " + this.member.ipAddress + ":" + this.member.port);
    if(this.moduleRegistrations == null) {
      this.printer.println(JSON.stringify("There is an error, the registration list is null")) ;
    } else {
      this.printer.printTable(this.moduleRegistrations,  fconfig);
    }
  };
}

cluster.MetricPrinter = function(printer, member, appMonitor) {
  this.printer = printer;
  this.member = member ;
  this.appMonitor = appMonitor ;
  this.printTimer = function() {
    var fconfig = [
      { field: '_key', header: 'Key', maxWidth: 30} ,
      { field: 'count', header: 'Count'} ,
      { field: "max"},
      { field: "mean"},
      { field: "min"},
      { field: "p50"},
      { field: "p75"},
      { field: "p95"},
      { field: "p98"},
      { field: "p99"}, 
      { field: "p999"}, 
      { field: "stddev"},
      { field: "meanRate"},
      { field: "m15Rate"},
      { field: "m1Rate"},
      { field: "m5Rate"},
      { field: "durationUnits"},
      { field: "rateUnits"}
    ];
    var metrics = this.getMetrics(this.appMonitor.registry.timers);
    this.printer.h2("Timer on " + (this.member.ipAddress + ":" + this.member.port) + " - member name " + this.member.memberName);
    this.printer.printTable(metrics,  fconfig);
  },

  this.printCounter = function() {
    var fconfig = [
      { field: '_key', header: 'Key'} ,
      { field: 'count', header: 'Count'} ,
    ];
    var metrics = this.getMetrics(this.appMonitor.registry.counters);
    this.printer.h2("Counter on " + (this.member.ipAddress + ":" + this.member.port));
    this.printer.printTable(metrics,  fconfig);
  };

  this.getMetrics = function(map) {
    var mobjs = [];
    for(var key in map) {
      var value = map[key];
      value['_key'] = key ;
      mobjs.push(value);
    }
    return mobjs;
  }
}

cluster.ClusterGateway = {
  members: function() {
    var json = JAVA_CLUSTER_GATEWAY.getMembers() ;
    return JSON.parse(json) ;
  },

  clusterRegistration: function() {
    var json = JAVA_CLUSTER_GATEWAY.clusterRegistration() ;
    return JSON.parse(json) ;
  },

  server : {
    call: function(command, config) {
      var json = JAVA_CLUSTER_GATEWAY.call('server', command, JSON.stringify(config.params)) ;
      var results = JSON.parse(json) ;
      if(config.onResponse) {
        config.onResponse(new cluster.Response(results));
      }
    },

    ping: function(config) { this.call('ping', config) ; },

    metric: function(config) { this.call('metric', config); },

    clearMetric: function(config) { this.call('clearMetric', config); },

    start: function(config) { this.call('start', config); },

    shutdown: function(config) { this.call('shutdown', config); },

    exit: function(config) { this.call('exit', config); }
  },

  module : {
    call: function(command, config) {
      var json = JAVA_CLUSTER_GATEWAY.call('module', command, JSON.stringify(config.params)) ;
      var results = JSON.parse(json) ;
      if(config.onResponse) {
        config.onResponse(new cluster.Response(results));
      }
    },

    list: function(config) { this.call('list', config) ; },

    install: function(config) { this.call('install', config) ; },

    uninstall: function(config) { this.call('uninstall', config); }
  },

  plugin: function(pluginName, command, config) {
    var plugin = JAVA_CLUSTER_GATEWAY.plugin(pluginName) ;
    if(config.params == null)  config.params = {} ; 
    config.params._commandName = command ;
    var json = plugin.call(JSON.stringify(config.params)) ;
    var results = JSON.parse(json) ;
    if(config.onResponse) {
      config.onResponse(new cluster.Response(results));
    }
  },

  call: function(pluginName, command, config) {
    return this.plugin(pluginName, command, config) ;
  }
}
