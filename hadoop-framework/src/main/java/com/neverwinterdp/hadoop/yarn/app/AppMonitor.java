package com.neverwinterdp.hadoop.yarn.app;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.apache.hadoop.yarn.api.records.Container;
import org.apache.hadoop.yarn.api.records.ContainerStatus;
import org.apache.hadoop.yarn.client.api.AMRMClient.ContainerRequest;

public class AppMonitor {
  private AtomicInteger completedContainerCount = new AtomicInteger() ;
  private AtomicInteger allocatedContainerCount = new AtomicInteger() ;
  private AtomicInteger failedContainerCount = new AtomicInteger() ;
  private AtomicInteger requestedContainerCount = new AtomicInteger() ;
  private Map<Integer, ContainerInfo> containerInfos = new LinkedHashMap<Integer, ContainerInfo>() ;
  
  public AtomicInteger getCompletedContainerCount() {
    return completedContainerCount;
  }

  public AtomicInteger getAllocatedContainerCount() {
    return allocatedContainerCount;
  }

  public AtomicInteger getFailedContainerCount() {
    return failedContainerCount;
  }

  public AtomicInteger getRequestedContainerCount() {
    return requestedContainerCount;
  }

  public ContainerInfo getContainerInfo(int id) { return containerInfos.get(id) ; }
  
  public ContainerInfo[] getContainerInfos() {
    return containerInfos.values().toArray(new ContainerInfo[containerInfos.size()]) ;
  }
  
  public void onContainerRequest(ContainerRequest containerReq) {
    requestedContainerCount.incrementAndGet() ;
  }
  
  public void onCompletedContainer(ContainerStatus status) {
    ContainerInfo cmonitor = containerInfos.get(status.getContainerId().getId()) ;
    completedContainerCount.incrementAndGet();
  }
  
  public void onFailedContainer(ContainerStatus status) {
    ContainerInfo cmonitor = containerInfos.get(status.getContainerId().getId()) ;
    failedContainerCount.incrementAndGet();
  }
  
  public void onAllocatedContainer(Container container, List<String> commands) {
    allocatedContainerCount.incrementAndGet() ;
    ContainerInfo cmonitor = new ContainerInfo(container, commands) ;
    containerInfos.put(cmonitor.getContainerId().getId(), cmonitor) ;
  }
}