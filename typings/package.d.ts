export type PackageJson = {
    name?: string;
    version?: string;
    description?: string;
    main?: string;
    scripts?: { [key: string]: string };
    repository?: {
      type: string;
      url: string;
    };
    keywords?: string[];
    author?: string;
    license?: string;
    bugs?: {
      url: string;
    };
    homepage?: string;
    dependencies?: { [key: string]: string };
    devDependencies?: { [key: string]: string };
    peerDependencies?: { [key: string]: string };
    optionalDependencies?: { [key: string]: string };
    bundledDependencies?: string[];
    engines?: { [key: string]: string };
    os?: string[];
    cpu?: string[];
    private?: boolean;
    publishConfig?: {
      registry: string;
    };
    workspaces?: string[];
    [key: string]: any
  };
  