Quick Reference Commands

    # Create overlay
    agentfs init my-overlay --base /path/to/project

    # Start NFS server
    agentfs serve nfs my-overlay

    # Mount overlay
    mount -t nfs -o vers=3,tcp,port=11111,mountport=11111,nolock 127.0.0.1:/ ./workspace

    # Check changes
    agentfs diff my-overlay

    # Unmount
    umount ./workspace
   