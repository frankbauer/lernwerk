class Result {
  public final LightCreateResult c2 = new LightCreateResult();
  public final LightCreateResult c3 = new LightCreateResult();
  public Boolean switchIDOk = null;
  public Boolean switchChangesLinked = null;
  public Boolean switchRejects5 = null;
  public Boolean switchUsesFirst5 = null;

  public final SwitchResult s1 = new SwitchResult();
  public final SwitchResult s2 = new SwitchResult();
  public final SwitchResult s3 = new SwitchResult();

  public String toJson() {
      SwitchResult sAll = new SwitchResult(s1);
      sAll.and(s2);
      sAll.and(s3);
      String s = "{";
      if (switchIDOk!=null) s += "\"switchIDOk\":" + switchIDOk + ",\n";
      if (switchChangesLinked!=null) s += "\"switchChangesLinked\":" + switchChangesLinked + ",\n";
      if (switchRejects5!=null) s += "\"switchRejects5\":" + switchRejects5 + ",\n";
      if (switchUsesFirst5!=null) s += "\"switchUsesFirst5\":" + switchUsesFirst5 + ",\n";
      s += "\"c2\":" + this.c2.toJson() + ",\n";
      s += "\"c3\":" + this.c3.toJson() + ",\n";
      s += "\"s1\":" + this.s1.toJson() + ",\n";
      s += "\"s2\":" + this.s2.toJson() + ",\n";
      s += "\"s3\":" + this.s3.toJson()+ ",\n";
      s += "\"sAll\":" + sAll.toJson();
      return s + "}";
  }
}

class LightCreateResult{
  public final LightResult sentInitial;
  public final LightResult initial;
  public final AdapterResult adapter;
  public final LightResult bounds;
  public final LightResult change;
  public final LightResult sentChange;
  public final LightResult sentBounds;


  LightCreateResult() {
      this.sentInitial = new LightResult();
      this.initial = new LightResult();
      this.bounds = new LightResult();
      this.change = new LightResult();
      this.sentChange = new LightResult();
      this.sentBounds = new LightResult();
      this.adapter = new AdapterResult();

      this.sentInitial.runMask = 0x01;
      this.sentBounds.runMask = 0x01;
  }

  public String toJson(){
      String s = "{";
      s += "\"initial\":" + this.initial.toJson() + ",\n";
      s += "\"change\":" + this.change.toJson() + ",\n";
      s += "\"sentInitial\":" + this.sentInitial.toJson() + ",\n";
      s += "\"sentChange\":" + this.sentChange.toJson() + ",\n";
      s += "\"sentBounds\":" + this.sentBounds.toJson() + ",\n";
      s += "\"bounds\":" + this.bounds.toJson() + ",\n";
      s += "\"adapter\":" + this.adapter.toJson();
      return s + "}";
  }
}

class StateResult {
  public boolean didRun;
  public int runMask;
  public  boolean validState;

  StateResult() {
      this.didRun = false;
      this.validState = false;
      this.runMask = 0;
  }

  @Override
  public String toString() {
      return toJson();
  }

  public String toJson(){
      String s = "{";
      s += "\"didRun\":" + this.didRun + ",";
      s += "\"runMask\":" + this.runMask + ",";
      s += "\"validState\":" + this.validState;
      return s + "}";
  }
}

class LightResult extends StateResult{
  public boolean validBrightness;
  public boolean validHue;
  public boolean validSaturation;

  LightResult() {
      this.validBrightness = false;
      this.validHue = false;
      this.validSaturation = false;
  }

  public String toString() {
      return toJson();
  }

  public String toJson() {
      String s = "{";
      s += "\"didRun\":" + this.didRun + ",";
      if (didRun && (this.runMask & 0xE)==0xE) s += "\"ok_col\":" + (this.validHue && this.validBrightness && this.validSaturation)+ ",";
      if (didRun && (this.runMask & 0x1)==0x1) s += "\"ok_state\":" + (this.validState)+ ",";
      if (didRun && (this.runMask & 0xF)==0xF) s += "\"ok_all\":" + (this.validState && this.validHue && this.validBrightness && this.validSaturation)+ ",";
      if (didRun) s += "\"valid\":" + (this.validState && this.validHue && this.validBrightness && this.validSaturation)+ ",";
      if (didRun && (this.runMask & 0x1)==0x1) s += "\"validState\":" + this.validState + ",";
      if (didRun && (this.runMask & 0x4)==0x4) s += "\"validBrightness\":" + this.validBrightness + ",";
      if (didRun && (this.runMask & 0x2)==0x2) s += "\"validHue\":" + this.validHue + ",";
      if (didRun && (this.runMask & 0x8)==0x8) s += "\"validSaturation\":" + this.validSaturation + ",";
      s += "\"runMask\":" + this.runMask;

      return s + "}";
  }

  public LightResult and(LightResult other){
      LightResult result = new LightResult();
      result.didRun = this.didRun || other.didRun;
      result.runMask = this.runMask | other.runMask;
      result.validState = this.validState && other.validState;
      result.validBrightness = this.validBrightness && other.validBrightness;
      result.validHue = this.validHue && other.validHue;
      result.validSaturation = this.validSaturation && other.validSaturation;
      return result;
  }

  public void and(LightResult a, LightResult b){
      this.didRun = a.didRun || b.didRun;
      this.runMask = a.runMask | b.runMask;
      this.validState = a.validState && b.validState;
      this.validBrightness = a.validBrightness && b.validBrightness;
      this.validHue = a.validHue && b.validHue;
      this.validSaturation = a.validSaturation && b.validSaturation;
  }
}

class AdapterResult {
  public  boolean didRun;
  public  boolean validIP;
  public  boolean validPort;
  public  boolean validEndpoint;

  AdapterResult() {
      this.didRun = false;
      this.validIP = true;
      this.validPort = true;
      this.validEndpoint = true;
  }

  public String toString() {
      return toJson();
  }

  public String toJson() {
      String s = "{";
      s += "\"didRun\":" + this.didRun + ",";
      if (this.didRun) s += "\"ok_all\":" + (this.validIP && this.validPort && this.validEndpoint) + ",";
      s += "\"validIP\":" + this.validIP + ",";
      s += "\"validPort\":" + this.validPort + ",";
      s += "\"validEndpoint\":" + this.validEndpoint;
      return s + "}";
  }
}

class SwitchResult {
  public boolean didRun;
  public boolean initialSwitchState;
  public boolean initialLightState;
  public boolean switchChanges;
  public boolean lightsChange;
  public final AdapterResult adapter;
  public boolean didSendInitialChange;
  public boolean didSendCorrectChange;
  public boolean didSendChange;
  public boolean linkedState;
  public boolean linkKeepsSwitchState;

  public SwitchResult(SwitchResult other){
      this.didRun = other.didRun;
      this.initialSwitchState = other.initialSwitchState;
      this.initialLightState = other.initialLightState;
      this.switchChanges = other.switchChanges;
      this.lightsChange = other.lightsChange;
      this.didSendInitialChange = other.didSendInitialChange;
      this.didSendCorrectChange = other.didSendCorrectChange;
      this.didSendChange = other.didSendChange;
      this.adapter = other.adapter;
      this.linkedState = other.linkedState;
      this.linkKeepsSwitchState = other.linkKeepsSwitchState;
  }

  public SwitchResult(){
      this.adapter = new AdapterResult();
      this.didRun = false;
      this.initialSwitchState = true;
      this.initialLightState = true;
      this.switchChanges = true;
      this.lightsChange = true;
      this.didSendInitialChange = false;
      this.didSendCorrectChange = true;
      this.didSendChange = false;
      this.linkedState = true;
      this.linkKeepsSwitchState = true;
  }

  public String toString() {
      return toJson();
  }

  public String toJson() {
      String s = "{";
      s += "\"didRun\":" + didRun + ",";
      if (didRun) s += "\"initialSwitchState\":" + initialSwitchState + ",";
      if (didRun) s += "\"initialLightState\":" + initialLightState + ",";
      if (didRun) s += "\"switchChanges\":" + switchChanges + ",";
      if (didRun)  s += "\"lightsChange\":" + lightsChange + ",";
      if (didRun)  s += "\"didSendInitialChange\":" + didSendInitialChange + ",";
      if (didRun && didSendChange)  s += "\"didSendChange\":" + didSendCorrectChange + ",";
      if (didRun) s += "\"linkedState\":" + linkedState + ",";
      if (didRun) s += "\"linkKeepsSwitchState\":" + linkKeepsSwitchState + ",";
      s += "\"adapter\":" + adapter.toJson();

      return s + "}";
  }

  public void and(SwitchResult other){
      this.didRun = this.didRun && other.didRun;
      this.initialSwitchState = this.initialSwitchState && other.initialSwitchState;
      this.initialLightState = this.initialLightState && other.initialLightState;
      this.switchChanges = this.switchChanges && other.switchChanges;
      this.lightsChange = this.lightsChange && other.lightsChange;
      this.didSendInitialChange = this.didSendInitialChange && other.didSendInitialChange;
      this.didSendCorrectChange = this.didSendCorrectChange && other.didSendCorrectChange;
      this.didSendChange = this.didSendChange && other.didSendChange;
      this.linkKeepsSwitchState = this.linkKeepsSwitchState && other.linkKeepsSwitchState;
      this.linkedState = this.linkedState && other.linkedState;
  }
}
