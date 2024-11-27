interface ValueTracker {
  void onSend(CommonAdapter a, String command, double value);
}
interface StateTracker {
  void onSend(CommonAdapter a, String command, boolean value);
}

class CommonAdapter {
  static ValueTracker vTracker = null;
  static StateTracker sTracker = null;
  public static int INSTANCE_COUNT = 0;
  public static boolean TEST_MODE = false;
  public final String ip;
  public final short port;
  public final String endpoint;

  public CommonAdapter(String ip, short port, String endpoint){
      INSTANCE_COUNT++;
      this.ip = ip;
      this.port = port;
      this.endpoint = endpoint;
  }

  public String toJson(){
      return "{\"ip\":\""+this.ip+"\",\"port\":"+this.port+",\"endpoint\":\""+this.endpoint+"\"}";
  }

  public String toString() {
      return "studon.Adapter{" +
              "ip='" + ip + '\'' +
              ", port=" + port +
              ", endpoint='" + endpoint + '\'' +
              '}';
  }

  private DoubleMessage createMessage(String cmd, double value){
      DoubleMessage msg = de.fau.tf.lgdv.CodeBlocks.createJSObject();
      msg.setCommand("w-"+cmd);
      msg.setId(0);
      msg.setValue(value);
      msg.setIP(this.ip);
      msg.setPort(this.port);
      msg.setEndpoint(this.endpoint);
      return msg;
  }

  private BooleanMessage createMessage(String cmd, boolean value){
      BooleanMessage msg = de.fau.tf.lgdv.CodeBlocks.createJSObject();
      msg.setCommand("w-"+cmd);
      msg.setId(0);
      msg.setValue(value);
      msg.setIP(this.ip);
      msg.setPort(this.port);
      msg.setEndpoint(this.endpoint);
      return msg;
  }

  protected void send(String command, double value){
      if (vTracker!=null) vTracker.onSend(this, command, value);
      if (!TEST_MODE) {
          de.fau.tf.lgdv.CodeBlocks.postMessage(createMessage(command, value));
      }
  }

  protected void send(String command, int value){
      send(command, (double)value);
  }

  protected void send(String command){
      send(command, false);
  }

  protected void send(String command, boolean value){
      if (sTracker!=null) sTracker.onSend(this, command, value);
      if (!TEST_MODE) {
          de.fau.tf.lgdv.CodeBlocks.postMessage(createMessage(command, value));
      }
  }

  static void setupCalls(){
      
  }
}

class Adapter extends CommonAdapter{
  public Adapter(String ip, short port, String endpoint){
      super(ip, port, endpoint);
  }

  public void send(String command, double value){
      super.send(command, value);
  }

  public void send(String command, int value){
      super.send(command, value);
  }

  public void send(String command){
      super.send(command);
  }
}

class SimpleAdapter extends CommonAdapter {
  public SimpleAdapter(int id){
      super("127.0.0.1", (short)80, ""+id);
  }

  public void send(String command){
      send("sw_"+command, false);
  }
}