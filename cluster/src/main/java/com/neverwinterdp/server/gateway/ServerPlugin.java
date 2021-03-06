package com.neverwinterdp.server.gateway;

import com.neverwinterdp.server.ServerRegistration;
import com.neverwinterdp.server.ServerState;
import com.neverwinterdp.server.command.ServerCommand;
import com.neverwinterdp.server.command.ServerCommandResult;
import com.neverwinterdp.server.command.ServerCommands;
import com.neverwinterdp.util.jvm.JVMInfo;
import com.neverwinterdp.util.monitor.snapshot.ApplicationMonitorSnapshot;

public class ServerPlugin extends Plugin {
  protected Object doCall(String commandName, CommandParams params) throws Exception {
    if("ping".equals(commandName)) return ping(params) ;
    else if("registration".equals(commandName)) return registration(params) ;
    else if("metric".equals(commandName)) return metric(params) ;
    else if("clearMetric".equals(commandName)) return clearMetric(params) ;
    else if("start".equals(commandName)) return start(params) ;
    else if("shutdown".equals(commandName)) return shutdown(params) ;
    else if("exit".equals(commandName)) return exit(params) ;
    else if("jvminfo".equals(commandName)) return jvminfo(params) ;
    return null ;
  }

  public ServerCommandResult<ServerState>[] ping(CommandParams params) {
    MemberSelector memberSelector = new MemberSelector(params) ;
    return ping(memberSelector) ;
  }
  
  public ServerCommandResult<ServerState>[] ping(MemberSelector memberSelector) {
    ServerCommand<ServerState> ping = new ServerCommands.Ping() ;
    ServerCommandResult<ServerState>[] results = memberSelector.execute(clusterClient, ping) ;
    return results ;
  }
  
  public ServerCommandResult<ServerRegistration>[] registration(CommandParams params) {
    return registration(new MemberSelector(params));
  }
  
  public ServerCommandResult<ServerRegistration>[] registration(MemberSelector memberSelector) {
    ServerCommands.GetServerRegistration cmd = new ServerCommands.GetServerRegistration() ;
    return memberSelector.execute(clusterClient, cmd) ;
  }
  
  public ServerCommandResult<ApplicationMonitorSnapshot>[] metric(CommandParams params) {
    MemberSelector memberSelector = new MemberSelector(params) ;
    String expression = params.getString("filter") ;
    return metric(memberSelector, expression) ;
  }
  
  public ServerCommandResult<ApplicationMonitorSnapshot>[] metric(MemberSelector memberSelector, String filter) {
    ServerCommand<ApplicationMonitorSnapshot> cmd = new ServerCommands.GetMonitorSnapshot(filter) ;
    return memberSelector.execute(clusterClient, cmd) ;
  }
  
  public ServerCommandResult<Integer>[] clearMetric(CommandParams params) {
    MemberSelector memberSelector = new MemberSelector(params) ;
    String expression = params.getString("expression") ;
    return clearMetric(memberSelector, expression) ;
  }
  
  public ServerCommandResult<Integer>[] clearMetric(MemberSelector memberSelector, String nameExp) {
    ServerCommand<Integer> cmd = new ServerCommands.ClearMonitor(nameExp) ;
    return memberSelector.execute(clusterClient, cmd) ;
  }
  
  public ServerCommandResult<ServerState>[] start(CommandParams params) {
    MemberSelector memberSelector = new MemberSelector(params) ;
    return start(memberSelector) ;
  }
  
  public ServerCommandResult<ServerState>[] start(MemberSelector memberSelector) {
    ServerCommand<ServerState> ping = new ServerCommands.Start() ;
    ServerCommandResult<ServerState>[] results = memberSelector.execute(clusterClient, ping) ;
    return results ;
  }
  
  public ServerCommandResult<ServerState>[] shutdown(CommandParams params) {
    MemberSelector memberSelector = new MemberSelector(params) ;
    return shutdown(memberSelector) ;
  }
  
  public ServerCommandResult<ServerState>[] shutdown(MemberSelector memberSelector) {
    ServerCommand<ServerState> ping = new ServerCommands.Shutdown() ;
    ServerCommandResult<ServerState>[] results = memberSelector.execute(clusterClient, ping) ;
    return results ;
  }
  
  public ServerCommandResult<ServerState>[] exit(CommandParams params) {
    MemberSelector memberSelector = new MemberSelector(params) ;
    return exit(memberSelector) ;
  }
  
  public ServerCommandResult<ServerState>[] exit( MemberSelector memberSelector) {
    ServerCommand<ServerState> ping = new ServerCommands.Exit() ;
    ServerCommandResult<ServerState>[] results = memberSelector.execute(clusterClient, ping) ;
    return results ;
  }
  
  public ServerCommandResult<JVMInfo>[] jvminfo(CommandParams params) {
    return jvminfo(new MemberSelector(params));
  }
  
  public ServerCommandResult<JVMInfo>[] jvminfo(MemberSelector memberSelector) {
    ServerCommands.GetJVMInfo cmd = new ServerCommands.GetJVMInfo() ;
    return memberSelector.execute(clusterClient, cmd) ;
  }
}