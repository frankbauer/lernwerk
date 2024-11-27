class MainOverride {
  public static void main(String[] args){
      CommonAdapter.TEST_MODE = false;
      CommonAdapter.setupCalls();

      Conductor.main(args);
  }
}