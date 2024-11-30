interface IPMessage extends de.fau.tf.lgdv.CodeBlocksBaseMessage {
  @org.teavm.jso.JSProperty
  String getIP();

  @org.teavm.jso.JSProperty
  void setIP(String value);

  @org.teavm.jso.JSProperty
  int getPort();

  @org.teavm.jso.JSProperty
  void setPort(int value);

  @org.teavm.jso.JSProperty
  String getEndpoint();

  @org.teavm.jso.JSProperty
  void setEndpoint(String value);
}

interface BooleanMessage extends IPMessage {
  @org.teavm.jso.JSProperty
  boolean getValue();

  @org.teavm.jso.JSProperty
  void setValue(boolean value);
}

interface DoubleMessage extends IPMessage {
  @org.teavm.jso.JSProperty
  double getValue();

  @org.teavm.jso.JSProperty
  void setValue(double value);
}