class Home {
  private static int LAST_ID;
  public static boolean didRegister = false;
  public static boolean invalidID;
  private static final java.util.HashMap<Integer, Object> switches = new java.util.HashMap<>();
  
  public static void registerSwitch(int id, CommonAdapter switchObject){
      System.err.println("Tried to register an Adapter Object: " + switchObject);
  }
          
  public static void registerSwitch(int id, Object switchObject){
      if (LAST_ID+1!=id) invalidID = true;
      didRegister = true;
      switches.put(id, switchObject);
      LAST_ID = id;
      
      if (!CommonAdapter.TEST_MODE){
          de.fau.tf.lgdv.CodeBlocks.postMessage("reg", id, id);
      }
  }

  static Object getSwitch(int id){
      return switches.get(id);
  }
}